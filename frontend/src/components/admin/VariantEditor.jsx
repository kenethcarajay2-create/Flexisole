
import { useState } from "react";
import {
  Plus,
  Trash2,
  ImageOff,
  Palette,
  ImageUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { uploadProductImage } from "../../services/uploadService";

const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42];

export function createEmptyVariant() {
  return {
    color: "",
    colorCode: "#D8B89E",
    sku: "",
    imageUrl: "",
    price: "",
    active: true,
    sizes: SIZE_OPTIONS.map((size) => ({
      size,
      stock: 0,
    })),
  };
}

export default function VariantEditor({
  variants,
  onChange,
  onUploadingChange,
}) {
  const { token } = useAuth();
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  function updateVariant(index, updates) {
    onChange(
      variants.map((variant, i) =>
        i === index ? { ...variant, ...updates } : variant
      )
    );
  }

  function addVariant() {
    if (uploadingKey !== null) return;

    onChange([...variants, createEmptyVariant()]);
  }

  function removeVariant(index) {
    if (uploadingKey !== null) return;

    onChange(variants.filter((_, i) => i !== index));
  }

  function updateStock(index, size, stock) {
    const variant = variants[index];
    const sizes = [...(variant.sizes || [])];

    const existing = sizes.findIndex(
      (item) => Number(item.size) === size
    );

    if (existing >= 0) {
      sizes[existing] = { size, stock };
    } else {
      sizes.push({ size, stock });
    }

    updateVariant(index, { sizes });
  }

  async function handleUpload(event, index) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || uploadingKey !== null) return;

    setUploadError("");
    setUploadSuccess("");
    setUploadingKey(index);
    onUploadingChange?.(true);

    try {
      const image = await uploadProductImage(file, token);

      updateVariant(index, {
        imageUrl: image.url,
      });

      setUploadSuccess(
        `Image uploaded for color ${index + 1}. Save the product to keep this change.`
      );
    } catch (error) {
      setUploadError(
        error.message || "Unable to upload image."
      );
    } finally {
      setUploadingKey(null);
      onUploadingChange?.(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-brand-900">
            Colors & Variants
          </h2>

          <p className="mt-1 text-sm text-brand-700">
            Add colors, upload product photos, set prices,
            and manage stock.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          disabled={uploadingKey !== null}
          className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          <Plus size={17} />
          Add Color
        </button>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {variants.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-300 bg-white px-6 py-12 text-center">
          <Palette
            size={34}
            className="mx-auto text-brand-600"
          />
          <p className="mt-3 text-sm text-brand-700">
            No colors yet. Click Add Color to create one.
          </p>
        </div>
      )}

      {variants.map((variant, index) => (
        <div
          key={variant._id || `variant-${index}`}
          className="rounded-3xl border border-brand-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-brand-900">
              Color {index + 1}
              {variant.color ? ` — ${variant.color}` : ""}
            </h3>

            <button
              type="button"
              disabled={uploadingKey !== null}
              onClick={() => removeVariant(index)}
              aria-label={`Remove color ${index + 1}`}
              className="rounded-full p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 size={19} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Color Name *
              </label>

              <input
                required
                type="text"
                value={variant.color}
                onChange={(event) =>
                  updateVariant(index, {
                    color: event.target.value,
                  })
                }
                placeholder="e.g. Peach Nude"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Color Code *
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(variant.colorCode)
                      ? variant.colorCode
                      : "#D8B89E"
                  }
                  onChange={(event) =>
                    updateVariant(index, {
                      colorCode: event.target.value,
                    })
                  }
                  className="h-12 w-14 cursor-pointer rounded-lg border border-brand-200 bg-white p-1"
                />

                <input
                  required
                  type="text"
                  value={variant.colorCode}
                  maxLength={7}
                  pattern="#[0-9a-fA-F]{6}"
                  onChange={(event) =>
                    updateVariant(index, {
                      colorCode: event.target.value,
                    })
                  }
                  className="min-w-0 flex-1 rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                Price (PHP)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(event) =>
                  updateVariant(index, {
                    price: event.target.value,
                  })
                }
                placeholder="e.g. 299"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-900">
                SKU (optional)
              </label>

              <input
                type="text"
                value={variant.sku || ""}
                onChange={(event) =>
                  updateVariant(index, {
                    sku: event.target.value,
                  })
                }
                placeholder="e.g. CLS-PEACH"
                className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
            </div>
          </div>

          {/* CLOUDINARY UPLOAD */}
          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
            <label className="mb-3 block text-sm font-semibold text-brand-900">
              Product Image
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white ${
                  uploadingKey !== null
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-brand-800"
                }`}
              >
                {uploadingKey === index ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <ImageUp size={18} />
                )}

                {uploadingKey === index
                  ? "Uploading..."
                  : variant.imageUrl
                    ? "Replace Image"
                    : "Upload Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingKey !== null}
                  onChange={(event) =>
                    handleUpload(event, index)
                  }
                  className="sr-only"
                />
              </label>

              <span className="text-xs text-brand-700">
                JPG, PNG or WebP · Max 5 MB
              </span>
            </div>

            <p className="mt-3 text-xs leading-6 text-brand-700">
              Your file is uploaded to Cloudinary first.
              Click Save Changes or Create Product afterward.
            </p>

            <label className="mb-2 mt-5 block text-xs font-semibold text-brand-800">
              Cloudinary Image URL
            </label>

            <input
              type="url"
              value={variant.imageUrl || ""}
              onChange={(event) =>
                updateVariant(index, {
                  imageUrl: event.target.value,
                })
              }
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600"
            />

            <div className="mt-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F1EA] sm:w-64">
              {variant.imageUrl ? (
                <img
                  key={variant.imageUrl}
                  src={variant.imageUrl}
                  alt={`${variant.color || "Product"} preview`}
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-brand-600">
                  <ImageOff size={30} />
                  <span className="text-xs">Image preview</span>
                </div>
              )}
            </div>
          </div>

          {/* STOCK */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-brand-900">
                Stock by Size
              </h4>

              <span className="text-xs text-brand-600">
                Quantity available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {SIZE_OPTIONS.map((size) => {
                const stock =
                  variant.sizes?.find(
                    (item) => Number(item.size) === size
                  )?.stock ?? 0;

                return (
                  <div key={size}>
                    <label className="mb-1 block text-center text-xs font-semibold text-brand-800">
                      Size {size}
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={stock}
                      onChange={(event) =>
                        updateStock(
                          index,
                          size,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-brand-200 px-2 py-3 text-center text-sm outline-none focus:border-brand-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm font-medium text-brand-900">
            <input
              type="checkbox"
              checked={variant.active !== false}
              onChange={(event) =>
                updateVariant(index, {
                  active: event.target.checked,
                })
              }
              className="h-4 w-4 accent-brand-900"
            />

            Active color variant
          </label>
        </div>
      ))}
    </section>
  );
}
