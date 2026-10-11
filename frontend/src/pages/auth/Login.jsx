import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

export default function Login() {
  return (
    <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-brand-900/10 bg-white p-8 text-center shadow-sm sm:p-12">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <UserRound
            size={28}
            className="text-brand-900"
          />
        </div>

        <h1 className="text-3xl font-semibold text-brand-900">
          Welcome to FlexiSole
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-500">
          Customer accounts and secure login
          will be available soon.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-brand-900 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Explore Products
        </Link>
      </div>
    </section>
  );
}