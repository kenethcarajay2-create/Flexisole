
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Palette,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const sections = [
  {
    title: "Products",
    description:
      "Create sandal styles, update details, and control which products appear in the shop.",
    icon: Package,
    path: "/admin/products",
  },
  {
    title: "Colors & Variants",
    description:
      "Manage product colors, Cloudinary images, available sizes, and inventory.",
    icon: Palette,
    path: "/admin/products",
  },
  {
    title: "Customer Orders",
    description:
      "View incoming orders and manage their fulfillment status.",
    icon: ShoppingBag,
    path: "/admin/orders",
  },
];

export default function Dashboard() {
  const { admin } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          ADMIN DASHBOARD
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
          Welcome, {admin?.name || "Administrator"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-brand-700">
          Manage your FlexiSole store from one place.
        </p>
      </div>

      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-5">
        <ShieldCheck
          size={23}
          className="mt-0.5 shrink-0 text-brand-700"
        />

        <div>
          <h2 className="font-semibold text-brand-900">
            Admin access enabled
          </h2>
          <p className="mt-1 text-sm leading-6 text-brand-700">
            You are signed in. Product editing and order management
            will become available as we connect the remaining backend APIs.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ title, description, icon: Icon, path }) => (
          <div
            key={title}
            className="rounded-3xl border border-brand-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Icon size={26} />
            </div>

            <h2 className="text-lg font-semibold text-brand-900">
              {title}
            </h2>

            <p className="mt-3 min-h-20 text-sm leading-7 text-brand-700">
              {description}
            </p>

            <Link
              to={path}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
            >
              Open section
              <ArrowUpRight size={18} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
