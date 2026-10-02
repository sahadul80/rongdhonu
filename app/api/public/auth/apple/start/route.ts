import { NextResponse } from "next/server";
import { appleConfigured, appleRedirectUri, createOAuthState, safeReturnTo } from "@/lib/publicOAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  if (url.searchParams.get("consent") !== "1") return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}identityError=consent-required`, request.url));
  if (!appleConfigured()) return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes("?") ? "&" : "?"}identityError=apple-not-configured`, request.url));

  const state = await createOAuthState("apple", returnTo);
  const auth = new URL("https://appleid.apple.com/auth/authorize");
  auth.searchParams.set("client_id", process.env.APPLE_CLIENT_ID!);
  auth.searchParams.set("redirect_uri", appleRedirectUri(request));
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("response_mode", "form_post");
  auth.searchParams.set("scope", "name email");
  auth.searchParams.set("state", state.state);
  auth.searchParams.set("nonce", state.nonce);
  return NextResponse.redirect(auth);
}
