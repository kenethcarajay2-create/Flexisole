
import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F3] px-6 py-20">
      <div className="max-w-lg text-center">

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100">
          <SearchX
            size={42}
            strokeWidth={1.5}
            className="text-brand-900"
          />
        </div>

        <h1 className="text-7xl font-bold tracking-tight text-brand-900 sm:text-8xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Oops! Page not found.
        </h2>

        <p className="mt-5 text-sm leading-7 text-gray-500 sm:text-base">
          The page you're looking for doesn't exist or may
          have been moved. Let's get you back to shopping.
        </p>

        <Link
          to="/"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <ArrowLeft size={18} />
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
