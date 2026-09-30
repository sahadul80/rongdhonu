import "server-only";
import { NEON_APPLICATION_NAME, NEON_DATA_API_URL } from "./neon-config";

/**
 * Optional server-side bridge for Neon Data API (PostgREST).
 *
 * The current CMS keeps its protected admin writes on direct Postgres access.
 * Public read APIs can opt in to Data API with NEON_USE_DATA_API=true. If the
 * Data API is unavailable, callers can safely fall back to the existing pg layer.
 */
export function isNeonDataApiEnabled(): boolean {
  return process.env.NEON_USE_DATA_API === "true";
}

export async function neonTableGet<T = Record<string, unknown>>(
  table: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T[] | null> {
  if (!isNeonDataApiEnabled()) return null;

  const base = NEON_DATA_API_URL.replace(/\/$/, "");
  const url = new URL(`${base}/${encodeURIComponent(table)}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Client-Info": NEON_APPLICATION_NAME,
  };
  const token = process.env.NEON_DATA_API_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Neon Data API ${response.status}: ${detail.slice(0, 240)}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as T[]) : [];
}
