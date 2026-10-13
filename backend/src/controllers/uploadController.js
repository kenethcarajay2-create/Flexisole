
import { v2 as cloudinary } from "cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    if (
      !allowedTypes.has(req.file.mimetype) ||
      req.file.size > MAX_BYTES
    ) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG or WebP images up to 5 MB are allowed.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary credentials are not configured.",
      });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          // Existing Cloudinary Media Library folder
          asset_folder: "FlexiSole/products",

          // Use the same path in new image public IDs
          public_id_prefix: "FlexiSole/products",

          resource_type: "image",
          overwrite: false,
          unique_filename: true,
        },
        (error, uploaded) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploaded);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      success: true,
      message: "Image uploaded to FlexiSole/products.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    next(error);
  }
}
