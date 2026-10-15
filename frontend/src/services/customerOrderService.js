const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")
).replace(/\/$/, "");

async function readResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || "Unable to complete the request.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function placeCustomerOrder(customer, cartItems, token) {
  if (!token) throw new Error("Please sign in before checkout.");
  const items = cartItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    size: Number(item.size),
    quantity: Number(item.quantity),
  }));
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ customer, items }),
  });
  return readResponse(response);
}

export async function fetchMyOrders(token) {
  const response = await fetch(`${API_URL}/orders/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(response);
}

export async function fetchMyOrder(id, token) {
  const response = await fetch(`${API_URL}/orders/mine/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse(response);
}
