
import { apiRequest } from "./api";

export async function uploadProductImage(file, token) {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Select a JPG, PNG or WebP image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const data = new FormData();
  data.append("image", file);

  const response = await apiRequest(
    "/admin/uploads/product-image",
    {
      method: "POST",
      token,
      body: data,
    }
  );

  if (!response.image?.url) {
    throw new Error("The upload did not return an image URL.");
  }

  return response.image;
}
