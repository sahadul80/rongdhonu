import "server-only";

/**
 * Reject cross-site browser POSTs while still allowing non-browser integrations
 * that omit Origin. Same-origin forms/fetches normally carry the Origin header.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin")?.trim();
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
