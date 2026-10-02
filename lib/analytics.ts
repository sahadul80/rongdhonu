import "server-only";
import { createHash } from "node:crypto";
import { query } from "./db";

export interface VisitorPayload {
  visitorId: string;
  sessionId: string;
  path: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  language?: string;
  languages?: string;
  timezone?: string;
  platform?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  cookiesEnabled?: boolean;
  browser?: string;
  operatingSystem?: string;
  deviceType?: string;
  isNewSession?: boolean;
}

const MAX_TEXT = 1000;
const MAX_PATH = 500;
const ANALYTICS_SALT = process.env.ANALYTICS_SALT || process.env.NEXTAUTH_SECRET || "rongdhonu-analytics";

function clean(value: unknown, max = MAX_TEXT): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
}

function int(value: unknown, max = 10000): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${ANALYTICS_SALT}:${ip}`).digest("hex");
}

export function maskIp(ip: string | null): string | null {
  if (!ip) return null;
  const value = ip.trim();
  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (value.includes(":")) return value.split(":").slice(0, 2).join(":") + ":****";
  return "***";
}

export function getRequestIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip")?.trim() || null;
}

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp/i.test(userAgent);
}

export async function recordVisitor(payload: VisitorPayload, request: Request): Promise<void> {
  const visitorId = clean(payload.visitorId, 80);
  const sessionId = clean(payload.sessionId, 80);
  const path = clean(payload.path, MAX_PATH);
  if (!visitorId || !sessionId || !path) return;

  const userAgent = clean(payload.userAgent, 1200);
  if (isBot(userAgent)) return;

  const ip = getRequestIp(request);
  const country = clean(request.headers.get("x-vercel-ip-country"), 64);
  const region = clean(request.headers.get("x-vercel-ip-country-region"), 128);
  const city = clean(request.headers.get("x-vercel-ip-city"), 128);
  const referrer = clean(payload.referrer, MAX_PATH);
  const language = clean(payload.language, 64);
  const languages = clean(payload.languages, 400);
  const timezone = clean(payload.timezone, 120);
  const platform = clean(payload.platform, 120);
  const browser = clean(payload.browser, 120);
  const operatingSystem = clean(payload.operatingSystem, 120);
  const deviceType = clean(payload.deviceType, 40);
  const pageTitle = clean(payload.pageTitle, 300);
  const landingPath = path;

  await query(
    `INSERT INTO site_visitors (
       visitor_id, first_seen_at, last_seen_at, visit_count, session_count,
       ip_hash, ip_masked, user_agent, browser, operating_system, device_type,
       language, languages, timezone, platform, screen_width, screen_height,
       viewport_width, viewport_height, cookies_enabled, country, region, city,
       referrer, landing_path, last_path, updated_at
     ) VALUES (
       $1, now(), now(), 1, $2,
       $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13, $14,
       $15, $16, $17, $18, $19, $20,
       $21, $22, $23, now()
     )
     ON CONFLICT (visitor_id) DO UPDATE SET
       last_seen_at = now(),
       visit_count = site_visitors.visit_count + 1,
       session_count = site_visitors.session_count + EXCLUDED.session_count,
       ip_hash = COALESCE(EXCLUDED.ip_hash, site_visitors.ip_hash),
       ip_masked = COALESCE(EXCLUDED.ip_masked, site_visitors.ip_masked),
       user_agent = COALESCE(EXCLUDED.user_agent, site_visitors.user_agent),
       browser = COALESCE(EXCLUDED.browser, site_visitors.browser),
       operating_system = COALESCE(EXCLUDED.operating_system, site_visitors.operating_system),
       device_type = COALESCE(EXCLUDED.device_type, site_visitors.device_type),
       language = COALESCE(EXCLUDED.language, site_visitors.language),
       languages = COALESCE(EXCLUDED.languages, site_visitors.languages),
       timezone = COALESCE(EXCLUDED.timezone, site_visitors.timezone),
       platform = COALESCE(EXCLUDED.platform, site_visitors.platform),
       screen_width = COALESCE(EXCLUDED.screen_width, site_visitors.screen_width),
       screen_height = COALESCE(EXCLUDED.screen_height, site_visitors.screen_height),
       viewport_width = COALESCE(EXCLUDED.viewport_width, site_visitors.viewport_width),
       viewport_height = COALESCE(EXCLUDED.viewport_height, site_visitors.viewport_height),
       cookies_enabled = COALESCE(EXCLUDED.cookies_enabled, site_visitors.cookies_enabled),
       country = COALESCE(EXCLUDED.country, site_visitors.country),
       region = COALESCE(EXCLUDED.region, site_visitors.region),
       city = COALESCE(EXCLUDED.city, site_visitors.city),
       referrer = COALESCE(EXCLUDED.referrer, site_visitors.referrer),
       last_path = EXCLUDED.last_path,
       updated_at = now()`,
    [
      visitorId,
      payload.isNewSession ? 1 : 0,
      hashIp(ip),
      maskIp(ip),
      userAgent,
      browser,
      operatingSystem,
      deviceType,
      language,
      languages,
      timezone,
      platform,
      int(payload.screenWidth, 10000),
      int(payload.screenHeight, 10000),
      int(payload.viewportWidth, 10000),
      int(payload.viewportHeight, 10000),
      typeof payload.cookiesEnabled === "boolean" ? payload.cookiesEnabled : null,
      country,
      region,
      city,
      referrer,
      landingPath,
      path,
    ],
  );

  await query(
    `INSERT INTO site_visit_events (visitor_id, session_id, visited_at, path, page_title, referrer, event_name)
     VALUES ($1, $2, now(), $3, $4, $5, 'page_view')`,
    [visitorId, sessionId, path, pageTitle, referrer],
  );
}
