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
 * Drop-in replacement for fetch() that automatically prepends the backend base URL
 * and includes a default 35-second AbortSignal timeout protection.
 * Usage: apiFetch("/api/auth/login", { method: "POST", ... })
 */
export function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const timeoutMs = options.timeout || 35000;
  
  const controller = new AbortController();
  const signal = options.signal || controller.signal;
  
  let timer = null;
  if (!options.signal) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  return fetch(url, { ...options, signal }).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

