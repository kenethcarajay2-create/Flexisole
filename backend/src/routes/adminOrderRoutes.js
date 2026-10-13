
import { Router } from "express";

import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

router.use(requireAdmin);

router.get("/", getAdminOrders);
router.get("/:id", getAdminOrder);
router.patch("/:id/status", updateAdminOrderStatus);

export default router;
