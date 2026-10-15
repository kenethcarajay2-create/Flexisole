
import { Router } from "express";
import rateLimit from "express-rate-limit";

import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  trackPageView,
  getAnalyticsOverview,
  getVisitorLocations,
} from "../controllers/analyticsController.js";

const router = Router();

const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post(
  "/track",
  trackingLimiter,
  trackPageView
);

router.get(
  "/overview",
  requireAdmin,
  getAnalyticsOverview
);

router.get(
  "/locations",
  requireAdmin,
  getVisitorLocations
);

export default router;
