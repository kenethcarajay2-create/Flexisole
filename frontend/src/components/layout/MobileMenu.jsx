import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { X, ArrowUpRight, ShoppingBag, UserRound } from "lucide-react";

const navigation = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] lg:hidden ${
        isOpen ? "visible" : "invisible pointer-events-none"
      }`}
    >
      {/* Dark background */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        className={`absolute inset-0 w-full bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding panel */}
      <div
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Mobile navigation"
        className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-[#FAF8F3] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-900/10 px-6 py-6">
          <Link
            to="/"
            onClick={onClose}
            className="text-2xl font-black tracking-tight text-brand-900"
          >
            flexi<span className="text-brand-500">sole.</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-brand-900 hover:bg-brand-100"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-8">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition ${
                  isActive
                    ? "bg-brand-100 text-brand-900"
                    : "text-brand-900/70 hover:bg-brand-100"
                }`
              }
            >
              {item.name}
              <ArrowUpRight size={19} />
            </NavLink>
          ))}

          <div className="my-4 border-t border-brand-900/10" />

          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-brand-900"
          >
            <ShoppingBag size={21} />
            Shopping Cart
          </Link>

          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-brand-900"
          >
            <UserRound size={21} />
            My Account
          </Link>
        </nav>

        <div className="border-t border-brand-900/10 p-6">
          <p className="text-center text-xs tracking-wide text-brand-900/50">
            COMFORT THAT MOVES WITH YOU
          </p>
        </div>
      </div>
    </div>
  );
}