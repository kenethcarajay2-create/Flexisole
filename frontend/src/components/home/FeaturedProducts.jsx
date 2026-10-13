
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import ProductCard from "../product/ProductCard";

import {
  getPublishedProducts,
  mapProductToGroup,
} from "../../services/productService";

export default function FeaturedProducts() {
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
              "Unable to load our collection."
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

  const featuredGroups = useMemo(() => {
    const groups = products
      .map(mapProductToGroup)
      .filter(
        (group) =>
          group &&
          group.variants.length > 0
      );

    // Prioritize products selected as Featured in Admin.
    const featured = groups.filter(
      (group) => group.featured
    );

    // If no products are marked Featured yet,
    // show the available published collection.
    const selectedGroups =
      featured.length > 0 ? featured : groups;

    return selectedGroups.slice(0, 3);
  }, [products]);

  return (
    <section
      id="featured-products"
      className="bg-cream px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* SECTION HEADER */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              OUR COLLECTION
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
              Find Your Perfect Pair
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-brand-700/80 sm:text-base">
              Discover our FlexiSole slipper collection,
              designed for everyday comfort.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-900 transition hover:text-brand-600"
          >
            View All Products
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div
            role="status"
            className="flex min-h-72 flex-col items-center justify-center gap-4"
          >
            <Loader2
              size={32}
              className="animate-spin text-brand-600"
            />

            <p className="text-sm text-brand-700">
              Loading our collection...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div
            role="alert"
            className="flex flex-col items-center rounded-3xl border border-brand-200 bg-white px-6 py-14 text-center"
          >
            <AlertCircle
              size={34}
              className="text-brand-600"
            />

            <h3 className="mt-4 text-xl font-semibold text-brand-900">
              Unable to load products
            </h3>

            <p className="mt-3 max-w-md text-sm text-brand-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadKey((previous) => previous + 1)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        )}

        {/* FEATURED PRODUCT GRID */}
        {!loading && !error && featuredGroups.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {featuredGroups.map((group) => (
              <ProductCard
                key={group.id}
                group={group}
              />
            ))}
          </div>
        )}

        {/* EMPTY COLLECTION */}
        {!loading && !error && featuredGroups.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-brand-200 bg-white px-6 py-16 text-center">
            <ShoppingBag
              size={38}
              className="text-brand-600"
            />

            <h3 className="mt-4 text-xl font-semibold text-brand-900">
              Collection coming soon
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-brand-700">
              We're preparing our latest FlexiSole styles.
              Check back soon!
            </p>
          </div>
        )}

        {/* BOTTOM BUTTON */}
        <div className="mt-14 flex justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 rounded-full border border-brand-300 bg-white px-8 py-4 text-sm font-semibold text-brand-900 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-100"
          >
            Explore Full Collection
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
