
import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  Feather,
  Info,
} from "lucide-react";

import {
  productGroups,
  getProductGroupBySlug,
} from "../../data/productGroups";

import ProductCard from "../../components/product/ProductCard";

function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "Price coming soon";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export default function ProductDetails() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const group = getProductGroupBySlug(slug);

  const selectedId = searchParams.get("color");

  const selectedProduct =
    group?.variants.find(
      (variant) => variant.id === selectedId
    ) ?? group?.variants[0];

  // Recommend different styles, not different colors
  // of the currently selected product.
  const relatedGroups = productGroups
    .filter((item) => item.slug !== slug)
    .map((item) => getProductGroupBySlug(item.slug))
    .filter((item) => item && item.variants.length > 0);

  if (!group || !selectedProduct) {
    return (
      <section className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold text-brand-900">
          Product not found
        </h1>

        <p className="mt-4 text-brand-700">
          This product may no longer be available.
        </p>

        <Link to="/shop" className="btn-primary mt-8">
          Back to Shop
        </Link>
      </section>
    );
  }

  function selectColor(variant) {
    setSearchParams({ color: variant.id });
    setSize(null);
    setQuantity(1);
  }

  function decreaseQuantity() {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((previous) =>
      Math.min(10, previous + 1)
    );
  }

  const availableSizes = selectedProduct.sizes ?? [];

  return (
    <main className="min-h-screen bg-cream">
      <div className="page-container pb-20 pt-7 lg:pb-28">

        {/* BREADCRUMBS */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-brand-700 sm:text-sm"
        >
          <Link to="/" className="hover:text-brand-900">
            Home
          </Link>

          <ChevronRight size={14} />

          <Link to="/shop" className="hover:text-brand-900">
            Shop
          </Link>

          <ChevronRight size={14} />

          <span className="font-medium text-brand-900">
            {group.name}
          </span>
        </nav>

        {/* MAIN PRODUCT LAYOUT */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">

          {/* LEFT: PRODUCT IMAGE */}
          <div className="min-w-0">
            <div className="group relative aspect-square overflow-hidden rounded-3xl border border-brand-900/5 bg-[#F7F1EA]">
              <img
                key={selectedProduct.image}
                src={selectedProduct.image}
                alt={`${group.name} in ${selectedProduct.color}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-brand-900 shadow-sm">
                {selectedProduct.color}
              </span>
            </div>

            {/* COLOR IMAGE THUMBNAILS */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {group.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectColor(variant)}
                  aria-label={`View ${variant.color}`}
                  aria-pressed={selectedProduct.id === variant.id}
                  className={`overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedProduct.id === variant.id
                      ? "border-brand-700"
                      : "border-transparent hover:border-brand-300"
                  }`}
                >
                  <img
                    src={variant.image}
                    alt={variant.color}
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <div className="bg-white px-3 py-3 text-center text-xs font-medium text-brand-900">
                    {variant.color}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFORMATION */}
          <div className="min-w-0 lg:sticky lg:top-28">
            <Link
              to="/shop"
              className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
            >
              <ArrowLeft size={16} />
              BACK TO COLLECTION
            </Link>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {group.category} Collection
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-brand-900 sm:text-5xl">
              {group.name}
            </h1>

            <p className="mt-3 text-base text-brand-700">
              {group.subtitle}
            </p>

            {/* PRICE AND DESCRIPTION */}
            <div className="mt-7 border-b border-brand-200 pb-7">
              <p className="text-2xl font-semibold text-brand-900">
                {formatPrice(selectedProduct.price)}
              </p>

              <p className="mt-3 text-sm leading-7 text-brand-700/80">
                {group.description}
              </p>
            </div>

            {/* COLOR SELECTION */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-brand-900">
                  Select Color
                </h2>

                <span className="text-sm text-brand-700">
                  {selectedProduct.color}
                </span>
              </div>

              <div
                className="flex flex-wrap gap-4"
                role="group"
                aria-label="Available colors"
              >
                {group.variants.map((variant) => {
                  const isSelected =
                    selectedProduct.id === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-label={variant.color}
                      aria-pressed={isSelected}
                      title={variant.color}
                      onClick={() => selectColor(variant)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 p-1 transition ${
                        isSelected
                          ? "border-brand-900"
                          : "border-brand-200 hover:border-brand-500"
                      }`}
                    >
                      <span
                        className="flex h-full w-full items-center justify-center rounded-full border border-black/10"
                        style={{
                          backgroundColor: variant.colorCode,
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={17}
                            className="text-brand-900"
                            strokeWidth={2.5}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mt-9">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-brand-900">
                  Select Size
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowSizeGuide((previous) => !previous)
                  }
                  aria-expanded={showSizeGuide}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
                >
                  <Info size={15} />
                  Size Information
                </button>
              </div>

              <div
                role="group"
                aria-label="Available sizes"
                className="grid grid-cols-4 gap-2 sm:grid-cols-7"
              >
                {availableSizes.map((availableSize) => (
                  <button
                    key={availableSize}
                    type="button"
                    onClick={() => setSize(availableSize)}
                    aria-pressed={size === availableSize}
                    className={`flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                      size === availableSize
                        ? "border-brand-900 bg-brand-900 text-white"
                        : "border-brand-200 bg-white text-brand-900 hover:border-brand-500"
                    }`}
                  >
                    {availableSize}
                  </button>
                ))}
              </div>

              {showSizeGuide && (
                <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm leading-7 text-brand-800">
                  Sizes are currently sample options for the
                  storefront. The official FlexiSole size chart
                  and measurements will be added after confirmation.
                </div>
              )}

              <p className="mt-3 text-xs text-brand-700/70">
                Please confirm actual sizing before purchasing.
              </p>
            </div>

            {/* QUANTITY */}
            <div className="mt-9">
              <h2 className="mb-4 text-sm font-semibold text-brand-900">
                Quantity
              </h2>

              <div className="inline-flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span
                  aria-live="polite"
                  className="w-12 text-center text-sm font-semibold text-brand-900"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity === 10}
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-brand-900 hover:bg-brand-100 disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ADD TO CART - NOT CONNECTED YET */}
            <div className="mt-9">
              <button
                type="button"
                disabled
                title="Ordering will be enabled when prices and inventory are confirmed"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white"
              >
                <ShoppingBag size={19} />
                Add to Cart — Coming Soon
              </button>

              <p className="mt-3 text-center text-xs leading-6 text-brand-700/70">
                We're preparing ordering, pricing, and
                inventory for the online store.
              </p>
            </div>

            {/* PRODUCT FEATURES */}
            <div className="mt-10 rounded-2xl border border-brand-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-brand-900">
                Product Details
              </h2>

              <ul className="mt-5 space-y-3">
                {group.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-brand-800"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-brand-600"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-brand-100 pt-6">
                <div className="flex items-center gap-2 text-xs text-brand-700">
                  <Feather size={18} />
                  Everyday Wear
                </div>

                <div className="flex items-center gap-2 text-xs text-brand-700">
                  <Package size={18} />
                  Travel-Friendly Concept
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OTHER PRODUCT STYLES */}
        {relatedGroups.length > 0 && (
          <section className="mt-20 border-t border-brand-200 pt-14">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  DISCOVER MORE
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
                  Other Styles You Might Like
                </h2>

                <p className="mt-3 text-sm text-brand-700/75">
                  Explore more FlexiSole styles and find your perfect fit.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
              >
                Shop All Styles
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGroups.map((relatedGroup) => (
                <ProductCard
                  key={relatedGroup.slug}
                  group={relatedGroup}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
