
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import ProductCard from "../product/ProductCard";
import {
  productGroups,
  getProductGroupBySlug,
} from "../../data/productGroups";

export default function FeaturedProducts() {
  const featuredGroups = productGroups
    .map((group) => getProductGroupBySlug(group.slug))
    .filter((group) => group && group.variants.length > 0);

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
              Explore three signature slipper styles,
              each available in two beautiful colors.
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

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {featuredGroups.map((group) => (
            <ProductCard
              key={group.slug}
              group={group}
            />
          ))}
        </div>

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
