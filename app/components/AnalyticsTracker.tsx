"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function idForStorage(key: string): string {
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, value);
  return value;
}

function sessionId(): { id: string; isNew: boolean } {
  const key = "rd-analytics-session-id";
  const startedKey = "rd-analytics-session-start";
  const now = Date.now();
  const existing = window.sessionStorage.getItem(key);
  const started = Number(window.sessionStorage.getItem(startedKey) || 0);
  if (existing && started && now - started < 30 * 60 * 1000) return { id: existing, isNew: false };
  const id = window.crypto?.randomUUID?.() || `${now.toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, id);
  window.sessionStorage.setItem(startedKey, String(now));
  return { id, isNew: true };
}

function browserName(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return "Safari";
  if (/firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

function operatingSystem(ua: string): string {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

function deviceType(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const query = searchParams?.toString() || "";
    const key = `${pathname}?${query}`;
    if (sentRef.current === key) return;
    sentRef.current = key;

    const visitorId = idForStorage("rd-analytics-visitor-id");
    const session = sessionId();
    const ua = navigator.userAgent;

    const payload = {
      visitorId,
      sessionId: session.id,
      isNewSession: session.isNew,
      path: query ? `${pathname}?${query}` : pathname,
      pageTitle: document.title,
      referrer: document.referrer || "",
      userAgent: ua,
      language: navigator.language || "",
      languages: navigator.languages?.join(",") || navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      platform: navigator.platform || "",
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      cookiesEnabled: navigator.cookieEnabled,
      browser: browserName(ua),
      operatingSystem: operatingSystem(ua),
      deviceType: deviceType(ua),
    };

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
