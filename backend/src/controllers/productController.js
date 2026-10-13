
import Product from "../models/Product.js";

// GET /api/products
// Show published products to customers.
export async function getProducts(req, res, next) {
  try {
    const products = await Product.find({
      published: true,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const visibleProducts = products.map((product) => ({
      ...product,
      variants: product.variants.filter(
        (variant) => variant.active
      ),
    }));

    res.status(200).json({
      success: true,
      count: visibleProducts.length,
      products: visibleProducts,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:slug
// Retrieve one published product.
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      published: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.variants = product.variants.filter(
      (variant) => variant.active
    );

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
}
