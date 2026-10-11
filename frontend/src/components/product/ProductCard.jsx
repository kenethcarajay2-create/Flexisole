
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff, Check } from "lucide-react";

import { getProductSlug } from "../../data/productGroups";

function formatPrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "Price coming soon";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export default function ProductCard({ group, product }) {
  const variants = group?.variants?.length
    ? group.variants
    : product
      ? [product]
      : [];

  const [selectedId, setSelectedId] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  if (variants.length === 0) return null;

  const selectedProduct =
    variants.find((item) => item.id === selectedId) ??
    variants[0];

  const slug = group?.slug ?? getProductSlug(selectedProduct);

  const destination = slug
    ? `/product/${slug}?color=${encodeURIComponent(selectedProduct.id)}`
    : "/shop";

  function selectColor(variant) {
    setSelectedId(variant.id);
    setImageFailed(false);
  }

  return (
    <article className="group min-w-0">
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-900/5 bg-[#F7F1EA]">
        {selectedProduct.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold tracking-widest text-brand-900 shadow-sm">
            {selectedProduct.badge}
          </span>
        )}

        <Link
          to={destination}
          aria-label={`View ${selectedProduct.name} in ${selectedProduct.color}`}
          className="block h-full w-full overflow-hidden"
        >
          {!imageFailed ? (
            <img
              key={selectedProduct.image}
              src={selectedProduct.image}
              alt={`${selectedProduct.style} in ${selectedProduct.color}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-brand-700">
              <ImageOff size={32} strokeWidth={1.5} />
              <span className="text-xs">
                Image unavailable
              </span>
            </div>
          )}

          <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-900 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-brand-900 group-hover:text-white">
            <ArrowUpRight size={20} />
          </span>
        </Link>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="px-1 pt-5">
        <Link to={destination}>
          <h3 className="text-lg font-semibold text-brand-900 transition-colors hover:text-brand-600">
            {group?.name ?? selectedProduct.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-brand-700/75">
          {group?.subtitle ?? selectedProduct.description}
        </p>

        <p className="mt-3 text-base font-semibold text-brand-900">
          {formatPrice(selectedProduct.price)}
        </p>

        {/* AVAILABLE COLORS */}
        <div className="mt-5 border-t border-brand-200/70 pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-brand-700">
              Available Colors
            </span>

            <span className="text-xs text-brand-700/70">
              {selectedProduct.color}
            </span>
          </div>

          <div
            className="flex flex-wrap items-center gap-3"
            role="group"
            aria-label={`Colors for ${group?.name ?? selectedProduct.name}`}
          >
            {variants.map((variant) => {
              const isSelected = selectedProduct.id === variant.id;

              return (
                <button
                  key={variant.id}
                  type="button"
                  title={variant.color}
                  aria-label={`Select ${variant.color}`}
                  aria-pressed={isSelected}
                  onClick={() => selectColor(variant)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 p-1 transition-all duration-200 hover:scale-110 ${
                    isSelected
                      ? "border-brand-900"
                      : "border-brand-200 hover:border-brand-500"
                  }`}
                >
                  <span
                    className="flex h-full w-full items-center justify-center rounded-full border border-black/5"
                    style={{
                      backgroundColor: variant.colorCode,
                    }}
                  >
                    {isSelected && (
                      <Check
                        size={13}
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

        {/* VIEW PRODUCT BUTTON */}
        <Link
          to={destination}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 transition hover:gap-3 hover:text-brand-600"
        >
          View Details
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
