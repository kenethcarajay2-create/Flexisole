
import { products } from "./products";

export const productGroups = [
  {
    slug: "classic-slides",
    name: "FlexiSole Classic Slides",
    subtitle: "Simple. Comfy. Always.",
    category: "Classic",
    description:
      "Discover our Classic Slides, designed with a minimalist single-band silhouette and a textured footbed for everyday wear.",
    features: [
      "Simple single-band design",
      "Textured footbed",
      "Easy slip-on style",
      "Everyday comfort",
    ],
  },
  {
    slug: "cross-strap-slides",
    name: "FlexiSole Cross-Strap Slides",
    subtitle: "More style. Same comfort.",
    category: "Cross-Strap",
    description:
      "A modern cross-strap design combining relaxed style and everyday convenience. Available in soft, versatile colors.",
    features: [
      "Cross-strap design",
      "Textured footbed",
      "Slip-on convenience",
      "Versatile everyday styling",
    ],
  },
  {
    slug: "double-band-slides",
    name: "FlexiSole Double-Band Slides",
    subtitle: "Trendy. Versatile. You.",
    category: "Double-Band",
    description:
      "Our Double-Band Slides feature two clean, wide straps for a modern look that pairs effortlessly with casual outfits.",
    features: [
      "Double-band design",
      "Textured footbed",
      "Easy slip-on style",
      "Minimalist everyday look",
    ],
  },
];

export function getProductGroupBySlug(slug) {
  const group = productGroups.find(
    (item) => item.slug === slug
  );

  if (!group) return null;

  return {
    ...group,
    variants: products.filter(
      (product) => product.category === group.category
    ),
  };
}

export function getProductSlug(product) {
  const group = productGroups.find(
    (item) => item.category === product.category
  );

  return group?.slug ?? null;
}
