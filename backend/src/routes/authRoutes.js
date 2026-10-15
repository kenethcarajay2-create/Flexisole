
import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  adminLogin,
  getCurrentAdmin,
  customerGoogleLogin,
  getCurrentCustomer,
} from "../controllers/authController.js";

import { requireAdmin } from "../middleware/authMiddleware.js";
import { requireCustomer } from "../middleware/customerAuthMiddleware.js";

const router = Router();

const customerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-in attempts. Try again later.",
  },
});

// Existing admin authentication
router.post("/admin/login", adminLogin);
router.get("/admin/me", requireAdmin, getCurrentAdmin);

// New customer Google authentication
router.post(
  "/customer/google",
  customerLoginLimiter,
  customerGoogleLogin
);

// Verify a returning customer's session
router.get(
  "/customer/me",
  requireCustomer,
  getCurrentCustomer
);

export default router;
