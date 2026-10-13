
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import ProductCard from "../../components/product/ProductCard";

import {
  getPublishedProducts,
  mapProductToGroup,
} from "../../services/productService";

const categories = [
  { label: "All Styles", value: "All" },
  { label: "Classic Slides", value: "Classic" },
  { label: "Cross-Strap", value: "Cross-Strap" },
  { label: "Double-Band", value: "Double-Band" },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const data = await getPublishedProducts();

        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const allGroups = useMemo(() => {
    return products
      .map(mapProductToGroup)
      .filter((group) => group.variants.length > 0);
  }, [products]);

  const filteredGroups = useMemo(() => {
    if (activeCategory === "All") {
      return allGroups;
    }

    return allGroups.filter(
      (group) => group.category === activeCategory
    );
  }, [allGroups, activeCategory]);

  const availableCategories = categories.filter(
    (category) =>
      category.value === "All" ||
      allGroups.some(
        (group) => group.category === category.value
      )
  );

  return (
    <main className="min-h-screen bg-cream">
      {/* SHOP HEADER */}
      <section className="bg-brand-100 px-5 py-16 text-center sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            THE FLEXISOLE COLLECTION
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
            Find Your Perfect Pair
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-brand-800/75 sm:text-base">
            Discover our signature slipper styles,
            designed for everyday comfort.
          </p>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">
              Shop All Styles
            </h2>

            <p className="mt-2 text-sm text-brand-700/75">
              {loading
                ? "Loading collection..."
                : `Showing ${filteredGroups.length} of ${allGroups.length} styles`}
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter products by style"
          >
            {availableCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() =>
                  setActiveCategory(category.value)
                }
                aria-pressed={
                  activeCategory === category.value
                }
                className={`rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  activeCategory === category.value
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-brand-200 bg-white text-brand-900 hover:bg-brand-100"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div
            role="status"
            className="flex min-h-72 flex-col items-center justify-center gap-4 text-brand-700"
          >
            <Loader2
              size={32}
              className="animate-spin text-brand-600"
            />
            <p className="text-sm">
              Loading FlexiSole products...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div
            role="alert"
            className="flex flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-16 text-center"
          >
            <AlertCircle
              size={36}
              className="text-red-500"
            />

            <h3 className="mt-4 text-xl font-semibold text-brand-900">
              Unable to load products
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-brand-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((key) => key + 1)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        )}

        {/* PRODUCT CARDS */}
        {!loading && !error && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {filteredGroups.map((group) => (
              <ProductCard
                key={group.id}
                group={group}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredGroups.length === 0 && (
          <div className="rounded-3xl bg-brand-100 px-6 py-20 text-center">
            <h3 className="text-lg font-semibold text-brand-900">
              No products available
            </h3>

            <p className="mt-3 text-sm text-brand-700">
              {allGroups.length === 0
                ? "Our collection is being prepared. Check back soon."
                : "No products found in this category."}
            </p>

            {allGroups.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className="mt-6 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white"
              >
                View All Styles
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
