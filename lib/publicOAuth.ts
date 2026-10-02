import "server-only";
import { createSign, randomBytes, timingSafeEqual, createPublicKey, verify as verifySignature } from "node:crypto";
import { cookies } from "next/headers";
import { setPublicProfileCookie, type PublicProfile } from "./publicProfile";

export type SocialProvider = "google" | "apple";

type OAuthState = {
  provider: SocialProvider;
  state: string;
  nonce: string;
  returnTo: string;
  createdAt: number;
};

export const OAUTH_STATE_COOKIE = "rd_public_oauth_state";
const OAUTH_MAX_AGE = 60 * 10;

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function safeReturnTo(value: string | null | undefined): string {
  const candidate = String(value ?? "/").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return "/";
  try {
    const parsed = new URL(candidate, "https://example.invalid");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export async function createOAuthState(provider: SocialProvider, returnTo: string) {
  const state: OAuthState = {
    provider,
    state: randomToken(),
    nonce: randomToken(),
    returnTo: safeReturnTo(returnTo),
    createdAt: Date.now(),
  };
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, Buffer.from(JSON.stringify(state), "utf8").toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: OAUTH_MAX_AGE,
  });
  return state;
}

export async function consumeOAuthState(provider: SocialProvider, incomingState: string | null | undefined): Promise<OAuthState | null> {
  const store = await cookies();
  const raw = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);
  if (!raw || !incomingState) return null;

  try {
    const state = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as OAuthState;
    if (state.provider !== provider || Date.now() - state.createdAt > OAUTH_MAX_AGE * 1000) return null;
    const a = Buffer.from(state.state);
    const b = Buffer.from(String(incomingState));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return state;
  } catch {
    return null;
  }
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appleConfigured(): boolean {
  return Boolean(
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY,
  );
}

export function googleRedirectUri(request: Request): string {
  return new URL("/api/public/auth/google/callback", request.url).toString();
}

export function appleRedirectUri(request: Request): string {
  return new URL("/api/public/auth/apple/callback", request.url).toString();
}

export async function setProfileFromOAuth(profile: PublicProfile): Promise<void> {
  await setPublicProfileCookie(profile);
}

async function appleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.APPLE_CLIENT_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = { iss: teamId, iat: now, exp: now + 60 * 60 * 24 * 30, aud: "https://appleid.apple.com", sub: clientId };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const input = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("SHA256");
  signer.update(input);
  signer.end();
  const signature = signer.sign({ key: privateKey, dsaEncoding: "ieee-p1363" });
  return `${input}.${signature.toString("base64url")}`;
}

function decodeJwtPart<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function parseJwt(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid identity token.");
  return {
    header: decodeJwtPart<{ alg: string; kid?: string }>(parts[0]),
    payload: decodeJwtPart<Record<string, unknown>>(parts[1]),
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: Buffer.from(parts[2], "base64url"),
  };
}

async function verifyAppleIdentityToken(idToken: string, expectedNonce: string): Promise<{ email: string; sub: string }> {
  const parsed = parseJwt(idToken);
  if (parsed.header.alg !== "RS256" || !parsed.header.kid) throw new Error("Unsupported Apple identity token.");
  const keysResponse = await fetch("https://appleid.apple.com/auth/keys", { cache: "no-store" });
  if (!keysResponse.ok) throw new Error("Could not load Apple signing keys.");
  const jwks = await keysResponse.json() as { keys?: Array<Record<string, unknown>> };
  const jwk = jwks.keys?.find((item) => item.kid === parsed.header.kid);
  if (!jwk) throw new Error("Apple signing key not found.");
  const publicKey = createPublicKey({ key: jwk as JsonWebKey, format: "jwk" });
  const verified = verifySignature(
    "RSA-SHA256",
    Buffer.from(parsed.signingInput),
    publicKey,
    parsed.signature,
  );
  if (!verified) throw new Error("Apple identity verification failed.");

  const payload = parsed.payload;
  const issuer = String(payload.iss ?? "");
  const audience = String(payload.aud ?? "");
  const email = String(payload.email ?? "").trim().toLowerCase();
  const sub = String(payload.sub ?? "");
  const nonce = String(payload.nonce ?? "");
  const exp = Number(payload.exp ?? 0);
  if (issuer !== "https://appleid.apple.com" || audience !== process.env.APPLE_CLIENT_ID || !email || !sub || exp <= Math.floor(Date.now() / 1000) || nonce !== expectedNonce) {
    throw new Error("Invalid Apple identity claims.");
  }
  return { email, sub };
}

export async function verifyAppleCode(code: string, redirectUri: string, nonce: string): Promise<{ email: string; sub: string }> {
  const clientSecret = await appleClientSecret();
  const body = new URLSearchParams({ client_id: process.env.APPLE_CLIENT_ID!, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: redirectUri });
  const response = await fetch("https://appleid.apple.com/auth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const data = await response.json() as { id_token?: string; error?: string };
  if (!response.ok || !data.id_token) throw new Error(data.error || "Apple authorization failed.");
  return verifyAppleIdentityToken(data.id_token, nonce);
}

export function appendQuery(path: string, params: Record<string, string>): string {
  const url = new URL(path, "https://example.invalid");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return `${url.pathname}${url.search}${url.hash}`;
}
