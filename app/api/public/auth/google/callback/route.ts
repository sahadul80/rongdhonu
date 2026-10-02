import { NextResponse } from "next/server";
import { consumeOAuthState, googleRedirectUri, setProfileFromOAuth, appendQuery } from "@/lib/publicOAuth";

function redirectWithError(request: Request, returnTo: string, code: string) {
  return NextResponse.redirect(new URL(appendQuery(returnTo, { identityError: code }), request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const incomingState = url.searchParams.get("state");
  const state = await consumeOAuthState("google", incomingState);
  const returnTo = state?.returnTo ?? "/";
  if (url.searchParams.get("error") || !state) return redirectWithError(request, returnTo, url.searchParams.get("error") || "identity-state-invalid");
  if (!code) return redirectWithError(request, returnTo, "google-code-missing");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, code, grant_type: "authorization_code", redirect_uri: googleRedirectUri(request) }),
    });
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error(tokenData.error || "Google authorization failed.");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` }, cache: "no-store" });
    const profile = await profileResponse.json() as { sub?: string; name?: string; email?: string; email_verified?: boolean };
    if (!profileResponse.ok || !profile.email || !profile.email_verified) throw new Error("Google account email could not be verified.");

    await setProfileFromOAuth({ name: String(profile.name ?? "").trim(), email: profile.email, provider: "google", providerSubject: String(profile.sub ?? "") });
    return NextResponse.redirect(new URL(appendQuery(returnTo, { identity: "google" }), request.url));
  } catch (error) {
    console.error("Google public profile sign-in failed:", error);
    return redirectWithError(request, returnTo, "google-failed");
  }
}
