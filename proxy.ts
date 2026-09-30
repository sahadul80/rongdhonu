import { NextResponse, type NextRequest } from "next/server";

// Duplicated (not imported from lib/auth.ts) on purpose: lib/auth.ts uses node:crypto
// and next/headers, neither of which the Edge Middleware runtime can load. Pulling
// COOKIE_NAME in via that module broke middleware compilation entirely (verified by
// actually running `next dev` — the real bug, not a hypothetical one). Keep this
// literal in sync with COOKIE_NAME in lib/auth.ts if it's ever renamed.
const COOKIE_NAME = "rd_admin_session";

/**
 * Presence-only redirect gate, same pattern as the sibling inventory/POS project:
 * this only checks that a session cookie exists so an unauthenticated visitor is
 * bounced to /admin/login before the page even renders. It does NOT verify the
 * cookie's signature or expiry (Edge middleware can't cheaply do that with Node's
 * crypto module) — every admin page and every /api/admin/* route re-verifies the
 * real signed session server-side via requireAdminSession(), and that check is the
 * actual security boundary.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/admin")) {
    const hasCookie = request.cookies.has(COOKIE_NAME);
    if (!hasCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
