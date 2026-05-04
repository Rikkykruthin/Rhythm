/**
 * api.ts — central fetch helper
 *
 * In development, all requests go to /api/* which Vite proxies to
 * http://localhost:8080 — so no CORS headers are needed at all.
 *
 * In production (e.g. Netlify), set VITE_API_URL to the deployed
 * backend URL (e.g. https://jamnights.onrender.com) in your env vars.
 * The helper will prepend it automatically.
 */

const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // trim trailing slash
  : "/api";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Always parse JSON — throws a clean error instead of "DOCTYPE …"
  let data: unknown;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(
      `Server returned non-JSON response (${res.status}): ${text.slice(0, 120)}`
    );
  }

  if (!res.ok) {
    const msg =
      (data as { error?: string })?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

/** Convenience: authenticated GET */
export function apiGet<T = unknown>(path: string, token?: string) {
  return apiFetch<T>(path, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Convenience: authenticated POST */
export function apiPost<T = unknown>(
  path: string,
  body: unknown,
  token?: string
) {
  return apiFetch<T>(path, {
    method: "POST",
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
