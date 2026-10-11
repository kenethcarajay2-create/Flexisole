
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  Feather,
  Footprints,
  Check,
  Sparkles,
} from "lucide-react";

import {
  cloudinaryAssets,
  getCloudinaryUrl,
} from "../config/cloudinary";

import "./About.css";

// CLOUDINARY OPTIMIZED IMAGES
const aboutImageMobile = getCloudinaryUrl(
  cloudinaryAssets.about,
  { width: 640 }
);

const aboutImageTablet = getCloudinaryUrl(
  cloudinaryAssets.about,
  { width: 1200 }
);

const aboutImageDesktop = getCloudinaryUrl(
  cloudinaryAssets.about,
  { width: 1920 }
);

const features = [
  {
    icon: Feather,
    title: "Lightweight Comfort",
    description:
      "Thoughtfully designed for easy movement and relaxed everyday wear.",
  },
  {
    icon: Footprints,
    title: "Everyday Versatility",
    description:
      "Minimalist slipper styles that complement your daily routine.",
  },
  {
    icon: Heart,
    title: "Simple & Thoughtful",
    description:
      "A balance of soft colors, practical design, and everyday comfort.",
  },
];

const highlights = [
  "Comfort-focused everyday styles",
  "Beautiful, versatile color options",
  "Simple and convenient shopping",
];

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      {/* BLENDED ABOUT HERO */}
      <section className="about-hero relative isolate overflow-hidden bg-cream">

        {/* DESKTOP BACKGROUND IMAGE */}
        <div className="absolute inset-0 hidden lg:block">
          <img
            src={aboutImageDesktop}
            srcSet={`
              ${aboutImageTablet} 1200w,
              ${aboutImageDesktop} 1920w
            `}
            sizes="100vw"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="about-background-image h-full w-full object-cover object-center"
          />

          {/* SOFT IMAGE BLEND */}
          <div className="about-gradient-overlay absolute inset-0" />
        </div>

        {/* MAIN CONTENT */}
        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center lg:min-h-[720px] lg:grid-cols-2">

          {/* LEFT CONTENT */}
          <div className="relative z-10 px-6 pb-10 pt-16 sm:px-10 sm:pt-20 lg:py-24">

            {/* SMALL BADGE */}
            <div className="about-fade-up about-delay-1 mb-7 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
              <Sparkles size={15} className="text-peach" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-900 sm:text-xs">
                THE FLEXISOLE STORY
              </span>
            </div>

            {/* MAIN HEADING */}
            <h1 className="about-fade-up about-delay-2 max-w-[600px] text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[1.1] tracking-[-0.05em] text-brand-900">
              A little more
              <br />
              comfort,
              <br />
              <span className="font-normal italic text-brand-600">
                every single day.
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="about-fade-up about-delay-3 mt-7 max-w-[450px] text-sm leading-8 text-brand-800/85 sm:text-base">
              At FlexiSole, we believe that everyday footwear
              should feel effortless. Our collection brings
              together simple styles, soft colors, and practical
              designs made for your everyday moments.
            </p>

            <p className="about-fade-up about-delay-3 mt-4 max-w-[450px] text-sm leading-8 text-brand-800/85 sm:text-base">
              From relaxing at home to stepping out for a casual
              day, we want comfort to be part of every step.
            </p>

            {/* HIGHLIGHTS */}
            <div className="about-fade-up about-delay-4 mt-8 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Check size={15} strokeWidth={2} />
                  </span>

                  <span className="text-sm font-medium text-brand-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* SHOP BUTTON */}
            <div className="about-fade-up about-delay-5 mt-9">
              <Link
                to="/shop"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-800 sm:w-auto"
              >
                Explore Our Collection

                <ArrowUpRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>

          {/* MOBILE / TABLET PHOTO */}
          <div className="about-mobile-visual relative w-full overflow-hidden lg:hidden">
            <img
              src={aboutImageMobile}
              srcSet={`
                ${aboutImageMobile} 640w,
                ${aboutImageTablet} 1200w
              `}
              sizes="100vw"
              alt="FlexiSole collection featuring Classic, Cross-Strap and Double-Band slippers"
              loading="eager"
              decoding="async"
              className="block aspect-[4/3] w-full object-cover object-center sm:aspect-[16/9]"
            />

            {/* BLENDED TOP EDGE */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream to-transparent" />

            {/* IMAGE BADGE */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md">
              <Heart
                size={15}
                className="fill-peach text-peach"
              />

              <span className="text-[10px] font-semibold tracking-wide text-brand-900">
                MADE FOR COMFORT
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-px bg-brand-900/5" />
      </section>

      {/* WHY FLEXISOLE SECTION */}
      <section className="bg-brand-50 px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              WHY FLEXISOLE
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
              Comfort meets simplicity.
            </h2>

            <p className="mt-5 text-sm leading-8 text-brand-700/80">
              Discover the little details that make our
              collection special.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-brand-200/70 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-900 group-hover:text-white">
                    <Icon size={26} strokeWidth={1.6} />
                  </div>

                  <h3 className="text-lg font-semibold text-brand-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-brand-700/80">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-cream px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            EXPLORE OUR COLLECTION
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Find your everyday pair.
          </h2>

          <p className="mt-5 text-sm leading-8 text-brand-700/80 sm:text-base">
            Discover simple, comfortable slippers in
            colors you'll love.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand-900 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Shop the Collection
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
