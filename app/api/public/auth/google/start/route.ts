import { NextResponse } from "next/server";
import { createOAuthState, googleConfigured, googleRedirectUri, safeReturnTo } from "@/lib/publicOAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  if (url.searchParams.get("consent") !== "1") return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}identityError=consent-required`, request.url));
  if (!googleConfigured()) return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}identityError=google-not-configured`, request.url));

  const state = await createOAuthState("google", returnTo);
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  auth.searchParams.set("redirect_uri", googleRedirectUri(request));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state.state);
  auth.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(auth);
}
