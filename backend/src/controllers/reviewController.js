import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function publicReview(review) {
  return {
    id: String(review._id),
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    displayName: review.displayName,
    verifiedPurchase: true,
    purchasedQuantity: review.purchasedQuantity,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

async function findStyle(slug) {
  return Product.findOne({ slug, published: true }).select("_id name slug");
}

function reviewName(name) {
  const parts = String(name || "Customer").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Customer";
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)[0]}.` : parts[0];
}

async function eligiblePurchase(productId, userId) {
  const orders = await Order.find({
    userId,
    status: "Delivered",
    "items.productId": productId,
  }).select("_id items createdAt").sort({ createdAt: -1 }).lean();

  let quantity = 0;
  for (const order of orders) {
    for (const item of order.items) {
      if (String(item.productId) === String(productId)) {
        quantity += item.quantity;
      }
    }
  }
  return { orderId: orders[0]?._id || null, quantity };
}

// Public: GET /api/products/:slug/reviews
export async function getProductReviews(req, res, next) {
  try {
    const product = await findStyle(req.params.slug);
    if (!product) return fail(res, 404, "Product not found.");

    const reviews = await Review.find({
      productId: product._id,
      status: "Published",
    }).sort({ createdAt: -1 }).limit(200).lean();

    const summary = await Review.aggregate([
      { $match: { productId: product._id, status: "Published" } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
    ]);

    // Feature reviews across all star levels. Larger purchases and
    // substantive comments influence selection; rating does not.
    const featured = [...reviews]
      .sort((a, b) => {
        const rank = (r) =>
          Math.min(r.purchasedQuantity, 20) * 5 +
          Math.min(r.comment.length, 400) / 40;
        return rank(b) - rank(a) || new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 5)
      .map(publicReview);

    return res.json({
      success: true,
      summary: {
        count: summary[0]?.count || 0,
        average: summary[0] ? Math.round(summary[0].average * 10) / 10 : 0,
      },
      featured,
      reviews: reviews.map(publicReview),
    });
  } catch (error) {
    next(error);
  }
}

// Customer-only: GET /api/products/reviews/mine
export async function getMyReviews(req, res, next) {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("productId", "name slug")
      .lean();
    return res.json({
      success: true,
      reviews: reviews.map((review) => ({
        ...publicReview(review),
        product: review.productId
          ? { name: review.productId.name, slug: review.productId.slug }
          : null,
        status: review.status,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// Customer-only: GET /api/products/:slug/reviews/eligibility
export async function getReviewEligibility(req, res, next) {
  try {
    const product = await findStyle(req.params.slug);
    if (!product) return fail(res, 404, "Product not found.");
    const [purchase, review] = await Promise.all([
      eligiblePurchase(product._id, req.user._id),
      Review.findOne({ productId: product._id, userId: req.user._id }).lean(),
    ]);
    return res.json({
      success: true,
      canReview: purchase.quantity > 0,
      purchasedQuantity: purchase.quantity,
      existingReview: review ? { ...publicReview(review), status: review.status } : null,
    });
  } catch (error) {
    next(error);
  }
}

// Customer-only: PUT /api/products/:slug/reviews/mine
export async function saveMyReview(req, res, next) {
  try {
    const product = await findStyle(req.params.slug);
    if (!product) return fail(res, 404, "Product not found.");

    const rating = Number(req.body?.rating);
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail(res, 400, "Choose a rating from 1 to 5 stars.");
    }
    if (title.length < 3 || title.length > 100) {
      return fail(res, 400, "Review title must be 3–100 characters.");
    }
    if (comment.length < 10 || comment.length > 1000) {
      return fail(res, 400, "Review must be 10–1000 characters.");
    }

    const purchase = await eligiblePurchase(product._id, req.user._id);
    if (!purchase.orderId || purchase.quantity < 1) {
      return fail(res, 403, "You can review this product style after an order containing it is marked Delivered.");
    }

    const review = await Review.findOneAndUpdate(
      { productId: product._id, userId: req.user._id },
      {
        $set: {
          rating,
          title,
          comment,
          purchasedQuantity: purchase.quantity,
          verifiedOrderId: purchase.orderId,
          displayName: reviewName(req.user.name),
        },
        $setOnInsert: { productId: product._id, userId: req.user._id },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, review: publicReview(review) });
  } catch (error) {
    if (error?.code === 11000) {
      return fail(res, 409, "Your review was updated elsewhere. Refresh and try again.");
    }
    next(error);
  }
}
