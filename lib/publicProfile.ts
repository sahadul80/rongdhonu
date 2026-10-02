import "server-only";
import { cookies } from "next/headers";

export const PUBLIC_PROFILE_COOKIE = "rd_form_profile";
export const PUBLIC_PROFILE_MAX_AGE = 60 * 60 * 24 * 180;
export const CONSENT_VERSION = "2026-10-02";

export interface PublicProfile {
  name: string;
  email: string;
  phone?: string;
  provider?: "google" | "apple" | "form";
  providerSubject?: string;
}

function sanitizeProfile(value: PublicProfile): PublicProfile {
  return {
    name: String(value.name ?? "").trim().slice(0, 160),
    email: String(value.email ?? "").trim().toLowerCase().slice(0, 200),
    phone: String(value.phone ?? "").trim().slice(0, 40),
    provider: value.provider === "google" || value.provider === "apple" || value.provider === "form" ? value.provider : undefined,
    providerSubject: String(value.providerSubject ?? "").trim().slice(0, 255) || undefined,
  };
}

export async function setPublicProfileCookie(profile: PublicProfile): Promise<void> {
  const clean = sanitizeProfile(profile);
  if (!clean.name && !clean.email && !clean.phone) return;

  const store = await cookies();
  try {
    store.set(PUBLIC_PROFILE_COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PUBLIC_PROFILE_MAX_AGE,
    });
  } catch (error) {
    console.warn("Could not save public profile cookie:", error);
  }
}

export async function getPublicProfile(): Promise<PublicProfile | null> {
  const store = await cookies();
  const value = store.get(PUBLIC_PROFILE_COOKIE)?.value;
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PublicProfile>;
    const profile = sanitizeProfile({
      name: String(parsed.name ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      provider: parsed.provider as PublicProfile["provider"],
      providerSubject: String(parsed.providerSubject ?? ""),
    });
    if (!profile.name && !profile.email && !profile.phone) return null;
    return profile;
  } catch {
    return null;
  }
}

export async function clearPublicProfileCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PUBLIC_PROFILE_COOKIE);
}
