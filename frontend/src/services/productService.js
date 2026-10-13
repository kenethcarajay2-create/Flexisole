
import { apiRequest } from "./api";
import {
  getProductCardImage,
  getProductDetailImage,
} from "../config/cloudinary";

// GET /api/products
// Fetch published products from MongoDB.
export async function getPublishedProducts() {
  const response = await apiRequest("/products");

  return Array.isArray(response.products)
    ? response.products
    : [];
}

// GET /api/products/:slug
// Fetch one published product for the details page.
export async function getPublishedProductBySlug(slug) {
  const response = await apiRequest(
    `/products/${encodeURIComponent(slug)}`
  );

  return response.product;
}

// Convert MongoDB product data into the structure
// used by the existing FlexiSole product components.
export function mapProductToGroup(product) {
  if (!product) return null;

  const variants = (product.variants || [])
    .filter((variant) => variant.active !== false)
    .map((variant) => {
      const originalImages = Array.isArray(variant.images)
        ? variant.images.filter(Boolean)
        : [];

      const stock = (variant.sizes || [])
        .map((item) => ({
          size: Number(item.size),
          stock: Number(item.stock) || 0,
        }))
        .filter(
          (item) =>
            Number.isInteger(item.size) &&
            Number.isInteger(item.stock)
        );

      return {
        id: String(variant._id),
        name: product.name,
        style: product.name,
        color: variant.color,
        colorCode: variant.colorCode,
        description: product.description || "",
        price: variant.price ?? null,
        image: originalImages[0]
          ? getProductCardImage(originalImages[0])
          : "",
        detailImage: originalImages[0]
          ? getProductDetailImage(originalImages[0])
          : "",
        images: originalImages.map((source) =>
          getProductDetailImage(source)
        ),
        sizes: stock.map((item) => item.size),
        stock,
        category: product.category,
        badge: product.badge || "",
        featured: Boolean(product.featured),
      };
    });

  return {
    id: String(product._id),
    slug: product.slug,
    name: product.name,
    category: product.category,
    subtitle: product.description || "",
    description: product.description || "",
    badge: product.badge || "",
    featured: Boolean(product.featured),
    features: [],
    variants,
  };
}
