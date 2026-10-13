
import { Router } from "express";
import {
  adminLogin,
  getCurrentAdmin,
} from "../controllers/authController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/admin/login", adminLogin);
router.get("/admin/me", requireAdmin, getCurrentAdmin);

export default router;
