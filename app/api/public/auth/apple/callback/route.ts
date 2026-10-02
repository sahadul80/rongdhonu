import { NextResponse } from "next/server";
import { appendQuery, appleRedirectUri, consumeOAuthState, setProfileFromOAuth, verifyAppleCode } from "@/lib/publicOAuth";

function redirectWithError(request: Request, returnTo: string, code: string) {
  return NextResponse.redirect(new URL(appendQuery(returnTo, { identityError: code }), request.url));
}

export async function POST(request: Request) {
  const form = await request.formData();
  const incomingState = String(form.get("state") ?? "");
  const state = await consumeOAuthState("apple", incomingState);
  const returnTo = state?.returnTo ?? "/";
  if (!state) return redirectWithError(request, returnTo, "identity-state-invalid");
  if (String(form.get("error") ?? "")) return redirectWithError(request, returnTo, "apple-cancelled");

  const code = String(form.get("code") ?? "");
  if (!code) return redirectWithError(request, returnTo, "apple-code-missing");

  try {
    const verified = await verifyAppleCode(code, appleRedirectUri(request), state.nonce);
    let name = "";
    const userRaw = String(form.get("user") ?? "");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw) as { name?: { firstName?: string; lastName?: string } };
        name = [user.name?.firstName, user.name?.lastName].filter(Boolean).join(" ").trim();
      } catch {
        // Apple only sends this object on the initial authorization. The email is still available in the ID token.
      }
    }
    await setProfileFromOAuth({ name, email: verified.email, provider: "apple", providerSubject: verified.sub });
    return NextResponse.redirect(new URL(appendQuery(returnTo, { identity: "apple" }), request.url));
  } catch (error) {
    console.error("Apple public profile sign-in failed:", error);
    return redirectWithError(request, returnTo, "apple-failed");
  }
}
