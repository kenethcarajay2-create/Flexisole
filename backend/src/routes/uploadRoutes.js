
import { Router } from "express";
import multer from "multer";

import { requireAdmin } from "../middleware/authMiddleware.js";
import { uploadProductImage } from "../controllers/uploadController.js";

const router = Router();

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG or WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

router.use(requireAdmin);

router.post(
  "/product-image",
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Image must be smaller than 5 MB."
              : error.message,
        });
      }

      next();
    });
  },
  uploadProductImage
);

export default router;
