
import { Link } from "react-router-dom";
import {
  Feather,
  Footprints,
  Heart,
  ArrowUpRight,
} from "lucide-react";

const benefits = [
  {
    icon: Feather,
    number: "01",
    title: "Lightweight Comfort",
    description:
      "Enjoy a lightweight feel designed to make everyday movement more comfortable.",
  },
  {
    icon: Footprints,
    number: "02",
    title: "Flexible Design",
    description:
      "A simple, flexible footwear concept made for convenience and everyday use.",
  },
  {
    icon: Heart,
    number: "03",
    title: "Everyday Essentials",
    description:
      "Minimalist slippers that complement your daily routine and personal style.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      id="why-flexisole"
      className="bg-brand-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
            THE FLEXISOLE EXPERIENCE
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
            Made for life's
            <span className="font-normal italic text-brand-600">
              {" "}little moments.
            </span>
          </h2>

          <p className="mt-6 text-sm leading-8 text-brand-800/70 sm:text-base">
            Our focus is simple: comfortable footwear,
            thoughtful design, and an effortless everyday experience.
          </p>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.number}
                className="group rounded-3xl border border-brand-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10"
              >
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition-colors duration-300 group-hover:bg-brand-900 group-hover:text-white">
                    <Icon size={29} strokeWidth={1.5} />
                  </div>

                  <span className="text-xs font-semibold tracking-widest text-brand-500">
                    {benefit.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-brand-900">
                  {benefit.title}
                </h3>

                <p className="mt-4 text-sm leading-8 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-14 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 rounded-full border border-brand-300 bg-white px-8 py-4 text-sm font-semibold text-brand-900 transition hover:bg-brand-900 hover:text-white"
          >
            Discover the Collection
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
