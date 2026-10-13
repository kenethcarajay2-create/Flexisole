
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  RefreshCw,
  Loader2,
  ImageOff,
} from "lucide-react";

import {
  getAdminProducts,
  deleteAdminProduct,
} from "../../services/adminService";

import { useAuth } from "../../context/AuthContext";

export default function Products() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminProducts(token);
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product._id);
    setError("");

    try {
      await deleteAdminProduct(product._id, token);
      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            ADMIN / PRODUCTS
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Product Management
          </h1>

          <p className="mt-3 text-sm text-brand-700">
            Add, edit, publish, and manage your FlexiSole collection.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus size={19} />
          Add Product
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-200 px-5 py-5 sm:px-7">
          <div>
            <h2 className="font-semibold text-brand-900">
              All Products
            </h2>

            <p className="mt-1 text-xs text-brand-600">
              {products.length} product styles
            </p>
          </div>

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-brand-700">
            <Loader2 size={24} className="animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <Package
              size={42}
              className="mx-auto text-brand-600"
            />

            <h3 className="mt-4 text-xl font-semibold text-brand-900">
              No products yet
            </h3>

            <p className="mt-3 text-sm text-brand-700">
              Add your first sandal style to MongoDB.
            </p>

            <Link
              to="/admin/products/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-100">
            {products.map((product) => {
              const firstImage =
                product.variants
                  ?.flatMap((variant) => variant.images || [])
                  .find(Boolean) || "";

              const totalStock = (product.variants || []).reduce(
                (sum, variant) =>
                  sum +
                  (variant.sizes || []).reduce(
                    (sizeSum, item) =>
                      sizeSum + (Number(item.stock) || 0),
                    0
                  ),
                0
              );

              return (
                <div
                  key={product._id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F1EA]">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff
                          size={27}
                          className="text-brand-600"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-brand-900">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs text-brand-700">
                        {product.category} · {product.variants?.length || 0} colors
                      </p>

                      <p className="mt-1 text-xs text-brand-700">
                        Total stock: {totalStock}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                          product.published
                            ? "bg-brand-100 text-brand-900"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {product.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:shrink-0">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === product._id}
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === product._id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
