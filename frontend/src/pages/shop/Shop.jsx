
import { useState } from "react";

import ProductCard from "../../components/product/ProductCard";

import {
  productGroups,
  getProductGroupBySlug,
} from "../../data/productGroups";

const categories = [
  { label: "All Styles", value: "All" },
  { label: "Classic Slides", value: "Classic" },
  { label: "Cross-Strap", value: "Cross-Strap" },
  { label: "Double-Band", value: "Double-Band" },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");

  const allGroups = productGroups
    .map((group) => getProductGroupBySlug(group.slug))
    .filter((group) => group && group.variants.length > 0);

  const filteredGroups =
    activeCategory === "All"
      ? allGroups
      : allGroups.filter(
          (group) => group.category === activeCategory
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
              Showing {filteredGroups.length} of {allGroups.length} styles
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter products by style"
          >
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveCategory(category.value)}
                aria-pressed={activeCategory === category.value}
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

        {/* PRODUCT CARDS */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {filteredGroups.map((group) => (
              <ProductCard
                key={group.slug}
                group={group}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-brand-100 px-6 py-20 text-center">
            <p className="text-brand-900">
              No products found in this category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
