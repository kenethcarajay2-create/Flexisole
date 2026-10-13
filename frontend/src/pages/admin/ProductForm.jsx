
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import VariantEditor, {
  createEmptyVariant,
} from "../../components/admin/VariantEditor";

import {
  createAdminProduct,
  updateAdminProduct,
} from "../../services/adminService";

import { useAuth } from "../../context/AuthContext";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildInitialState(product) {
  if (!product) {
    return {
      name: "",
      slug: "",
      category: "Classic",
      description: "",
      badge: "",
      featured: false,
      published: false,
      variants: [createEmptyVariant()],
    };
  }

  return {
    name: product.name || "",
    slug: product.slug || "",
    category: product.category || "Classic",
    description: product.description || "",
    badge: product.badge || "",
    featured: Boolean(product.featured),
    published: Boolean(product.published),
    variants: (product.variants || []).map((variant) => ({
      _id: variant._id,
      color: variant.color || "",
      colorCode: variant.colorCode || "#D8B89E",
      sku: variant.sku || "",
      imageUrl: variant.images?.[0] || "",
      price:
        variant.price == null ? "" : String(variant.price),
      active: variant.active !== false,
      sizes: (variant.sizes || []).map((item) => ({
        size: Number(item.size),
        stock: String(item.stock),
      })),
    })),
  };
}

export default function ProductForm({ product = null }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() =>
    buildInitialState(product)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(product?._id);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateName(name) {
    setForm((previous) => ({
      ...previous,
      name,
      slug:
        !isEditing &&
        (!previous.slug ||
          previous.slug === slugify(previous.name))
          ? slugify(name)
          : previous.slug,
    }));
  }

  function preparePayload() {
    if (form.variants.length === 0) {
      throw new Error("Add at least one color variant.");
    }

    const colors = new Set();

    const variants = form.variants.map((variant) => {
      const color = variant.color.trim();
      const colorKey = color.toLowerCase();

      if (!color) {
        throw new Error("Every variant needs a color name.");
      }

      if (colors.has(colorKey)) {
        throw new Error("Each variant must have a unique color name.");
      }

      colors.add(colorKey);

      const price =
        variant.price === ""
          ? null
          : Number(variant.price);

      if (
        price !== null &&
        (!Number.isFinite(price) || price < 0)
      ) {
        throw new Error(`Invalid price for ${color}.`);
      }

      const sizes = variant.sizes.map((item) => {
        if (
          item.stock === "" ||
          !Number.isInteger(Number(item.stock)) ||
          Number(item.stock) < 0
        ) {
          throw new Error(
            `Enter a valid stock quantity for ${color}, size ${item.size}.`
          );
        }

        return {
          size: Number(item.size),
          stock: Number(item.stock),
        };
      });

      const imageUrl = variant.imageUrl.trim();

      if (
        imageUrl &&
        !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(
          imageUrl
        )
      ) {
        throw new Error(
          `Enter a valid Cloudinary image URL for ${color}.`
        );
      }

      return {
        color,
        colorCode: variant.colorCode.trim(),
        sku: (variant.sku || "").trim(),
        images: imageUrl ? [imageUrl] : [],
        price,
        active: variant.active !== false,
        sizes,
      };
    });

    if (
      form.published &&
      !variants.some(
        (variant) =>
          variant.active &&
          variant.images.length > 0 &&
          variant.price !== null &&
          variant.sizes.length > 0
      )
    ) {
      throw new Error(
        "To publish, add an active color with an image, price, and available sizes."
      );
    }

    return {
      name: form.name.trim(),
      slug: slugify(form.slug),
      category: form.category,
      description: form.description.trim(),
      badge: form.badge.trim(),
      featured: form.featured,
      published: form.published,
      variants,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSaving(true);

    try {
      const payload = preparePayload();

      if (isEditing) {
        await updateAdminProduct(
          product._id,
          payload,
          token
        );
      } else {
        await createAdminProduct(payload, token);
      }

      navigate("/admin/products", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Unable to save product."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-12">
      <Link
        to="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeft size={17} />
        Back to Products
      </Link>

      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          PRODUCT MANAGEMENT
        </p>

        <h1 className="text-3xl font-semibold text-brand-900">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>

        <p className="mt-2 text-sm text-brand-700">
          Manage the sandal style, colors, images, prices,
          and inventory.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-brand-900">
            Product Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Product Name *
              </label>
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) => updateName(e.target.value)}
                placeholder="FlexiSole Classic Slides"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Product Slug *
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) =>
                  updateField("slug", slugify(e.target.value))
                }
                placeholder="classic-slides"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
              <p className="mt-1 text-xs text-brand-600">
                Used in the product URL.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600"
              >
                <option value="Classic">Classic</option>
                <option value="Cross-Strap">Cross-Strap</option>
                <option value="Double-Band">Double-Band</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Product Badge
              </label>
              <input
                value={form.badge}
                onChange={(e) =>
                  updateField("badge", e.target.value)
                }
                placeholder="BEST SELLER / NEW"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-brand-900">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              placeholder="Describe your product..."
              className="w-full resize-y rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-brand-900">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  updateField("featured", e.target.checked)
                }
                className="h-4 w-4 accent-brand-900"
              />
              Featured Product
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-brand-900">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  updateField("published", e.target.checked)
                }
                className="h-4 w-4 accent-brand-900"
              />
              Publish to Store
            </label>
          </div>

          <p className="mt-3 text-xs leading-6 text-brand-600">
            Unpublished products are saved as drafts and hidden
            from the public Product API.
          </p>
        </section>

        <VariantEditor
          variants={form.variants}
          onChange={(variants) =>
            updateField("variants", variants)
          }
        />

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            to="/admin/products"
            className="rounded-full border border-brand-200 px-7 py-3.5 text-center text-sm font-semibold text-brand-900 hover:bg-brand-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
