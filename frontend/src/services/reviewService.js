const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")
).replace(/\/$/, "");

async function request(endpoint, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || "Unable to load reviews.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const fetchProductReviews = (slug) =>
  request(`/products/${encodeURIComponent(slug)}/reviews`);
export const fetchReviewEligibility = (slug, token) =>
  request(`/products/${encodeURIComponent(slug)}/reviews/eligibility`, { token });
export const saveProductReview = (slug, token, review) =>
  request(`/products/${encodeURIComponent(slug)}/reviews/mine`, {
    token,
    method: "PUT",
    body: JSON.stringify(review),
  });
export const fetchMyReviews = (token) =>
  request("/products/reviews/mine", { token });
