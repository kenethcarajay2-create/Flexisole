
import { apiRequest } from "./api";

const BASE_PATH = "/admin/products";

export function getAdminProducts(token) {
  return apiRequest(BASE_PATH, { token });
}

export function getAdminProduct(id, token) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    token,
  });
}

export function createAdminProduct(product, token) {
  return apiRequest(BASE_PATH, {
    method: "POST",
    token,
    body: JSON.stringify(product),
  });
}

export function updateAdminProduct(id, product, token) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(product),
  });
}

export function deleteAdminProduct(id, token) {
  return apiRequest(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}
