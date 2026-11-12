
import { getAuthToken } from "./authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(endpoint, options = {}) {
  const headers = { ...options.headers };
  const token = getAuthToken();

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  patch: (endpoint, data) => request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
};