
import { apiRequest } from "./api";

export async function createCustomerOrder(customer, cartItems) {
  const items = cartItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    size: Number(item.size),
    quantity: Number(item.quantity),
  }));

  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      customer,
      items,
      paymentMethod: "COD",
    }),
  });
}

export function getAdminOrders(token) {
  return apiRequest("/admin/orders", { token });
}

export function getAdminOrder(id, token) {
  return apiRequest(
    `/admin/orders/${encodeURIComponent(id)}`,
    { token }
  );
}

export function updateAdminOrderStatus(id, status, token) {
  return apiRequest(
    `/admin/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    }
  );
}
