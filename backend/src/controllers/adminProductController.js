
import mongoose from "mongoose";
import Product from "../models/Product.js";

const allowedFields = [
  "name",
  "slug",
  "category",
  "description",
  "badge",
  "featured",
  "published",
  "variants",
];

function validateProduct(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Invalid product information.";
  }

  if (!data.name?.trim() || !data.category?.trim()) {
    return "Product name and category are required.";
  }

  if (
    !data.slug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
  ) {
    return "Enter a valid product slug.";
  }

  if (!Array.isArray(data.variants)) {
    return "Product variants must be an array.";
  }

  const colors = new Set();

  for (const variant of data.variants) {
    if (!variant || typeof variant !== "object") {
      return "Invalid variant information.";
    }

    if (
      typeof variant.color !== "string" ||
      !variant.color.trim() ||
      typeof variant.colorCode !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(variant.colorCode)
    ) {
      return "Every variant needs a color name and valid hex color.";
    }

    const colorKey = variant.color.trim().toLowerCase();

    if (colors.has(colorKey)) {
      return "Duplicate color names are not allowed.";
    }

    colors.add(colorKey);

    if (
      variant.price != null &&
      (typeof variant.price !== "number" ||
        !Number.isFinite(variant.price) ||
        variant.price < 0)
    ) {
      return "Variant prices must be positive numbers or empty.";
    }

    if (
      !Array.isArray(variant.images) ||
      variant.images.some(
        (url) =>
          typeof url !== "string" ||
          !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(
            url
          )
      )
    ) {
      return "Variant images must be valid Cloudinary image URLs.";
    }

    if (!Array.isArray(variant.sizes)) {
      return "Variant sizes must be an array.";
    }

    const sizes = new Set();

    for (const item of variant.sizes) {
      if (
        !Number.isInteger(item?.size) ||
        item.size < 1 ||
        !Number.isInteger(item?.stock) ||
        item.stock < 0
      ) {
        return "Sizes and stock must use valid whole numbers.";
      }

      if (sizes.has(item.size)) {
        return "Duplicate sizes are not allowed in a variant.";
      }

      sizes.add(item.size);
    }
  }

  if (
    data.published &&
    (
      data.variants.length === 0 ||
      !data.variants.some(
        (variant) =>
          variant.active !== false &&
          variant.images.length > 0 &&
          variant.price != null &&
          variant.sizes.length > 0
      )
    )
  ) {
    return "A published product needs a sellable variant with an image, price, and sizes.";
  }

  return null;
}

function pickProductFields(body) {
  return Object.fromEntries(
    allowedFields
      .filter((key) =>
        Object.prototype.hasOwnProperty.call(body, key)
      )
      .map((key) => [key, body[key]])
  );
}

function sendError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A product with this slug already exists.",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return null;
}

// GET /api/admin/products
export async function getAdminProducts(req, res, next) {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/products/:id
export async function getAdminProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/products
export async function createAdminProduct(req, res, next) {
  try {
    const data = pickProductFields(req.body || {});
    const validationError = validateProduct(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await Product.create(data);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    if (sendError(res, error)) return;
    next(error);
  }
}

// PUT /api/admin/products/:id
export async function updateAdminProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const data = {
      ...product.toObject(),
      ...pickProductFields(req.body || {}),
    };

    const validationError = validateProduct(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        product.set(field, req.body[field]);
      }
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    if (sendError(res, error)) return;
    next(error);
  }
}

// DELETE /api/admin/products/:id
export async function deleteAdminProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
