
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Heart,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Shop Collection", path: "/shop" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const customerLinks = [
  { label: "My Cart", path: "/cart" },
  { label: "My Account", path: "/account" },
  { label: "Contact Support", path: "/contact" },
];

const socialPlatforms = [
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebookF,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
  },
];

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSocialLinks() {
      try {
        const response = await fetch(
          `${API_URL}/settings`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load social links.");
        }

        const data = await response.json();

        if (!controller.signal.aborted && data.success) {
          setSocialLinks({
            facebook: data.socialLinks?.facebook || "",
            instagram: data.socialLinks?.instagram || "",
            tiktok: data.socialLinks?.tiktok || "",
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn(
            "Social media links unavailable:",
            error
          );
        }
      }
    }

    loadSocialLinks();

    return () => controller.abort();
  }, []);

  return (
    <footer className="bg-brand-900 text-white">
      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-block text-4xl font-black tracking-[-0.06em]"
            >
              flexi
              <span className="text-brand-300">
                sole.
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Discover everyday comfort with FlexiSole.
              Simple, lightweight footwear designed
              to move with you wherever life takes you.
            </p>

            {/* SOCIAL MEDIA ICONS */}
            <div className="mt-7 flex items-center gap-3">
              {socialPlatforms.map(
                ({ key, label, icon: Icon }) => {
                  const url = socialLinks[key];

                  if (!url) {
                    return null;
                  }

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`FlexiSole ${label}`}
                      title={`Visit our ${label}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:border-brand-300 hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={18} />
                    </a>
                  );
                }
              )}
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.15em]">
              Explore
            </h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}

                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.15em]">
              Customer Care
            </h3>

            <ul className="space-y-4">
              {customerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* COD AND GCASH BADGES REMOVED */}
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.15em]">
              Get in Touch
            </h3>

            <p className="mb-6 text-sm leading-7 text-white/60">
              Have a question about our products?
              Reach out through our contact page.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-brand-300"
                />
                <span>Philippines</span>
              </div>

              <Link
                to="/contact"
                className="flex items-center gap-3 text-sm text-white/60 transition hover:text-white"
              >
                <Mail
                  size={18}
                  className="shrink-0 text-brand-300"
                />
                Contact Support
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-3 text-sm text-white/60 transition hover:text-white"
              >
                <Phone
                  size={18}
                  className="shrink-0 text-brand-300"
                />
                Customer Assistance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:px-8 lg:px-10">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} FlexiSole.
            All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-white/50">
            Made with
            <Heart
              size={13}
              className="fill-brand-300 text-brand-300"
            />
            for everyday comfort.
          </p>
        </div>
      </div>
    </footer>
  );
}
