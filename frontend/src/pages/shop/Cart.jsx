
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function Cart() {
  return (
    <section className="min-h-[70vh] bg-[#FAF8F3] px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Your Shopping Bag
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
            Shopping Cart
          </h1>
        </div>

        {/* Empty Cart */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-brand-900/10 bg-white px-6 py-20 text-center">

          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100">
            <ShoppingBag
              size={40}
              strokeWidth={1.4}
              className="text-brand-900"
            />
          </div>

          <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">
            Your cart is empty
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
            Looks like you haven't added anything yet.
            Explore our FlexiSole collection and find your perfect pair.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
