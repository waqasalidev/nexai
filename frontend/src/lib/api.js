/**
 * api.js — Shared API fetch utility for NexAI
 *
 * In production (Vercel), the frontend and backend are on different domains.
 * All fetch("/api/...") calls must be prefixed with the backend base URL.
 *
 * VITE_API_BASE_URL is set in frontend/.env and in Vercel environment variables.
 * In development, it falls back to "" (empty), which keeps the Vite proxy working.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Drop-in replacement for fetch() that automatically prepends the backend base URL.
 * Usage: apiFetch("/api/auth/login", { method: "POST", ... })
 */
export function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  return fetch(url, options);
}
