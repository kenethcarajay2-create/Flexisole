
import { Router } from "express";

import { requireAdmin } from "../middleware/authMiddleware.js";

import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/storeSettingsController.js";

const publicSettingsRouter = Router();
const adminSettingsRouter = Router();

// Customers and visitors can read social links.
publicSettingsRouter.get("/", getPublicSettings);

// Only administrators can read or update settings.
adminSettingsRouter.use(requireAdmin);

adminSettingsRouter.get("/", getAdminSettings);
adminSettingsRouter.put("/", updateAdminSettings);

export {
  publicSettingsRouter,
  adminSettingsRouter,
};
