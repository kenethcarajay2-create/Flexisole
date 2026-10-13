
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  UserRound,
  Search,
  X,
} from "lucide-react";

import MobileMenu from "./MobileMenu";
import { useCart } from "../../context/CartContext";

import {
  cloudinaryAssets,
  getLogoImage,
} from "../../config/cloudinary";

const navigation = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { itemCount } = useCart();

  function handleSearch(event) {
    event.preventDefault();

    if (!searchQuery.trim()) return;

    // Product search functionality will be added later.
    setSearchOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-brand-900/10 bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-5 sm:h-[76px] sm:px-8 lg:h-[82px] lg:px-10">
          {/* FLEXISOLE CLOUDINARY LOGO */}
          <Link
            to="/"
            aria-label="FlexiSole homepage"
            className="flex h-full w-[115px] shrink-0 items-center justify-start sm:w-[145px] lg:w-[170px]"
          >
            <img
              src={getLogoImage(cloudinaryAssets.logo)}
              alt="FlexiSole Logo"
              decoding="async"
              fetchPriority="high"
              className="block h-auto max-h-[65px] w-full max-w-full object-contain sm:max-h-[70px] lg:max-h-[76px]"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `py-3 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-brand-600"
                      : "text-brand-900/75 hover:text-brand-900"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* NAVBAR ACTIONS */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {/* SEARCH */}
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100"
            >
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>

            {/* ACCOUNT */}
            <Link
              to="/login"
              aria-label="My account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100 sm:flex"
            >
              <UserRound size={21} />
            </Link>

            {/* CART WITH LIVE COUNTER */}
            <Link
              to="/cart"
              aria-label={`Shopping cart with ${itemCount} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100"
            >
              <ShoppingBag size={22} />

              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-brand-900 px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100 lg:hidden"
            >
              <Menu size={25} />
            </button>
          </div>
        </div>

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div className="border-t border-brand-900/10 bg-cream px-5 py-4">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-brand-200 bg-white px-5 py-3"
            >
              <Search size={20} className="shrink-0 text-brand-600" />

              <input
                type="search"
                placeholder="Search for slippers..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-brand-900 outline-none"
              />

              <button
                type="submit"
                className="text-sm font-semibold text-brand-900"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
