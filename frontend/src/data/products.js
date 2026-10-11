
import {
  cloudinaryAssets,
  getProductCardImage,
  getProductDetailImage,
} from "../config/cloudinary";

function createProductImages(source) {
  const cardImage = getProductCardImage(source);
  const detailImage = getProductDetailImage(source);

  return {
    image: cardImage,
    images: [detailImage],
    detailImage,
  };
}

export const products = [
  {
    id: "flex-001",
    name: "FlexiSole Classic Slides",
    style: "Classic Slides",
    color: "Peach Nude",
    colorCode: "#F5C0A6",
    description: "Simple, comfy, always.",
    price: null,
    ...createProductImages(cloudinaryAssets.classicPeachNude),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Classic",
    badge: "BEST SELLER",
    featured: true,
  },
  {
    id: "flex-002",
    name: "FlexiSole Classic Slides",
    style: "Classic Slides",
    color: "Cream Beige",
    colorCode: "#EADCC6",
    description: "Simple, comfy, always.",
    price: null,
    ...createProductImages(cloudinaryAssets.classicCreamBeige),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Classic",
    badge: "",
    featured: true,
  },
  {
    id: "flex-003",
    name: "FlexiSole Cross-Strap Slides",
    style: "Cross-Strap Slides",
    color: "Dusty Pink",
    colorCode: "#DFA0A2",
    description: "More style. Same comfort.",
    price: null,
    ...createProductImages(cloudinaryAssets.crossStrapDustyPink),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Cross-Strap",
    badge: "NEW",
    featured: true,
  },
  {
    id: "flex-004",
    name: "FlexiSole Cross-Strap Slides",
    style: "Cross-Strap Slides",
    color: "Mocha Brown",
    colorCode: "#A67C65",
    description: "More style. Same comfort.",
    price: null,
    ...createProductImages(cloudinaryAssets.crossStrapMochaBrown),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Cross-Strap",
    badge: "",
    featured: true,
  },
  {
    id: "flex-005",
    name: "FlexiSole Double-Band Slides",
    style: "Double-Band Slides",
    color: "Ivory White",
    colorCode: "#F0E8D8",
    description: "Trendy. Versatile. You.",
    price: null,
    ...createProductImages(cloudinaryAssets.doubleBandIvoryWhite),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Double-Band",
    badge: "",
    featured: true,
  },
  {
    id: "flex-006",
    name: "FlexiSole Double-Band Slides",
    style: "Double-Band Slides",
    color: "Caramel Tan",
    colorCode: "#C68D62",
    description: "Trendy. Versatile. You.",
    price: null,
    ...createProductImages(cloudinaryAssets.doubleBandCaramelTan),
    sizes: [36, 37, 38, 39, 40, 41, 42],
    category: "Double-Band",
    badge: "",
    featured: true,
  },
];

export const getProductById = (id) =>
  products.find((product) => product.id === id);
