
import mongoose from "mongoose";

const { Schema } = mongoose;

// Stock is tracked separately for each size.
const sizeStockSchema = new Schema(
  {
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: Number.isInteger,
    },
  },
  { _id: false }
);

// Each color is a variant of one product.
const variantSchema = new Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      required: true,
      match: /^#[0-9a-fA-F]{6}$/,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [sizeStockSchema],
      default: [],
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.index({ published: 1, category: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
