
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

          {/* FLEXISOLE LOGO */}
          <Link
            to="/"
            aria-label="FlexiSole homepage"
            className="flex h-full w-[115px] shrink-0 items-center justify-start sm:w-[145px] lg:w-[170px]"
          >
            <img
              src="/images/branding/logo.png"
              alt="FlexiSole Logo"
              className="block h-auto w-full max-w-full object-contain"
              style={{
                width: "100%",
                maxHeight: "100px",
                objectFit: "contain",
              }}
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
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100"
            >
              {searchOpen ? (
                <X size={21} />
              ) : (
                <Search size={21} />
              )}
            </button>

            {/* ACCOUNT */}
            <Link
              to="/login"
              aria-label="My account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100 sm:flex"
            >
              <UserRound size={21} />
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 transition hover:bg-brand-100"
            >
              <ShoppingBag size={22} />
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
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
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

      {/* MOBILE MENU */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
