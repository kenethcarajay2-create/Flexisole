import { Router } from "express";
import { getProducts, getProductBySlug } from "../controllers/productController.js";
import { requireCustomer } from "../middleware/customerAuthMiddleware.js";
import {
  getProductReviews,
  getMyReviews,
  getReviewEligibility,
  saveMyReview,
} from "../controllers/reviewController.js";

const router = Router();
router.get("/", getProducts);
// Register /reviews/mine BEFORE /:slug.
router.get("/reviews/mine", requireCustomer, getMyReviews);
router.get("/:slug/reviews", getProductReviews);
router.get("/:slug/reviews/eligibility", requireCustomer, getReviewEligibility);
router.put("/:slug/reviews/mine", requireCustomer, saveMyReview);
router.get("/:slug", getProductBySlug);
export default router;
