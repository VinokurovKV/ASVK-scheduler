export const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
  });
