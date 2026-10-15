
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  X,
  Settings,
} from "lucide-react";

const links = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    to: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Social Media Settings",
    to: "/admin/settings/social",
    icon: Settings,
  },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <div className="text-xl font-bold tracking-tight">
              FlexiSole
            </div>

            <div className="text-xs text-white/60">
              Admin Panel
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-brand-900"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} className="shrink-0" />

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* VIEW CUSTOMER WEBSITE */}
        <div className="border-t border-white/10 p-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10"
          >
            <Store size={19} />
            View Store
          </NavLink>
        </div>
      </aside>
    </>
  );
}
