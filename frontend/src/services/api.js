
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(
  path,
  { token, ...options } = {}
) {
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "omit",
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Check that your backend is running.",
      0
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new ApiError("Invalid server response.", response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || "Something went wrong.",
      response.status
    );
  }

  return data;
}
