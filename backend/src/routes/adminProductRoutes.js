
import { Router } from "express";

import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../controllers/adminProductController.js";

const router = Router();

// Protect every route in this router.
router.use(requireAdmin);

router.get("/", getAdminProducts);
router.post("/", createAdminProduct);

router.get("/:id", getAdminProduct);
router.put("/:id", updateAdminProduct);
router.delete("/:id", deleteAdminProduct);

export default router;
