
import { apiRequest } from "./api";

export function recordPageView(event) {
  return apiRequest("/analytics/track", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function getAnalyticsOverview(token) {
  return apiRequest("/admin/analytics/overview", {
    token,
  });
}
