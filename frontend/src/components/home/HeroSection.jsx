
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDown,
  Sparkles,
  Feather,
  Package,
  Heart,
} from "lucide-react";

import {
  cloudinaryAssets,
  getCloudinaryUrl,
} from "../../config/cloudinary";

import "./HeroSection.css";

// Optimized Cloudinary hero images
const heroImageMobile = getCloudinaryUrl(
  cloudinaryAssets.hero,
  { width: 800 }
);

const heroImageTablet = getCloudinaryUrl(
  cloudinaryAssets.hero,
  { width: 1200 }
);

const heroImageDesktop = getCloudinaryUrl(
  cloudinaryAssets.hero,
  { width: 1920 }
);

const features = [
  {
    icon: Feather,
    label: "LIGHTWEIGHT",
  },
  {
    icon: Package,
    label: "PORTABLE",
  },
  {
    icon: Heart,
    label: "EVERYDAY COMFORT",
  },
];

export default function HeroSection() {
  return (
    <section className="hero-section relative isolate overflow-hidden bg-cream">

      {/* DESKTOP BACKGROUND */}
      <div className="absolute inset-0 hidden overflow-hidden lg:block">
        <img
          src={heroImageDesktop}
          srcSet={`
            ${heroImageTablet} 1200w,
            ${heroImageDesktop} 1920w
          `}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="hero-image-zoom h-full w-full object-cover object-center"
        />

        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(250,247,243,0.98) 0%, rgba(250,247,243,0.94) 27%, rgba(250,247,243,0.66) 43%, rgba(250,247,243,0.04) 65%)",
          }}
        />
      </div>

      {/* HERO CONTENT */}
      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center lg:min-h-[680px] lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative z-10 px-6 pb-8 pt-16 sm:px-10 sm:pt-20 lg:py-24">

          {/* TOP BADGE */}
          <div className="hero-entrance hero-delay-1 mb-7 inline-flex items-center gap-2 rounded-full border border-brand-300/70 bg-white/75 px-4 py-2 shadow-sm backdrop-blur-sm">
            <Sparkles
              size={15}
              className="hero-sparkle text-peach"
            />

            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-900 sm:text-xs">
              Everyday Comfort Reimagined
            </span>
          </div>

          {/* HEADLINE */}
          <h1 className="hero-entrance hero-delay-2 max-w-[620px] text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[1.09] tracking-[-0.055em] text-brand-900">
            Comfort that
            <br />

            <span className="font-normal italic text-brand-600">
              moves
            </span>{" "}

            with you.
          </h1>

          {/* DESCRIPTION */}
          <p className="hero-entrance hero-delay-3 mt-7 max-w-[440px] text-sm leading-8 text-brand-800/85 sm:text-base">
            Discover a new level of everyday comfort with
            FlexiSole. Lightweight, flexible, and made for
            wherever life takes you.
          </p>

          {/* ACTION BUTTONS */}
          <div className="hero-entrance hero-delay-4 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">

            <Link
              to="/shop"
              className="hero-button group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-900/10 transition-all duration-300 hover:bg-brand-800"
            >
              Shop Collection

              <ArrowUpRight
                size={19}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>

            <a
              href="#featured-products"
              className="hero-button group inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-brand-300 bg-white/75 px-8 py-4 text-sm font-semibold text-brand-900 transition-all duration-300 hover:bg-white"
            >
              Explore Products

              <ArrowDown
                size={18}
                className="transition-transform duration-300 group-hover:translate-y-1"
              />
            </a>
          </div>

          {/* FEATURES */}
          <div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="hero-feature flex items-center gap-2 text-brand-800"
                  style={{
                    animationDelay: `${1.1 + index * 0.2}s`,
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.5}
                    className="text-brand-600"
                  />

                  <span className="text-[10px] font-semibold tracking-[0.08em] sm:text-xs">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE AND TABLET IMAGE */}
        <div className="relative w-full overflow-hidden lg:hidden">
          <img
            src={heroImageMobile}
            srcSet={`
              ${heroImageMobile} 800w,
              ${heroImageTablet} 1200w
            `}
            sizes="100vw"
            alt="FlexiSole slippers in cream and blush pink with a matching travel pouch"
            fetchPriority="high"
            decoding="async"
            className="hero-image-mobile block aspect-[4/3] w-full object-cover object-[75%_center] sm:aspect-[16/9]"
          />

          <div className="hero-floating-badge absolute bottom-5 right-5 rounded-full border border-white/60 bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-bold tracking-[0.12em] text-brand-900">
              MADE TO MOVE
            </span>
          </div>
        </div>

        {/* DESKTOP FLOATING BADGE */}
        <div className="hero-floating-badge absolute bottom-10 right-10 hidden rounded-full border border-white/70 bg-white/90 px-6 py-4 shadow-xl backdrop-blur-md lg:block">
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-peach"
            />

            <span className="text-xs font-bold tracking-[0.12em] text-brand-900">
              MADE TO MOVE
            </span>
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <a
        href="#featured-products"
        aria-label="Scroll to featured products"
        className="hero-scroll-indicator absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-brand-800/70 transition hover:text-brand-900 lg:block"
      >
        <ArrowDown
          size={20}
          strokeWidth={1.5}
        />
      </a>

      <div className="relative h-px bg-brand-900/5" />
    </section>
  );
}
