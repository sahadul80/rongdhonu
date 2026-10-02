import "server-only";
import { query } from "./db";

export interface AnalyticsPoint {
  date: string;
  visitors: number;
}

export interface VisitorAnalyticsRow {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
  sessionCount: number;
  ipMasked: string | null;
  userAgent: string | null;
  browser: string | null;
  operatingSystem: string | null;
  deviceType: string | null;
  language: string | null;
  languages: string | null;
  timezone: string | null;
  platform: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  cookiesEnabled: boolean | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  landingPath: string | null;
  lastPath: string | null;
}

export interface DashboardContentItem {
  id: string;
  type: "services" | "work" | "team" | "reviews";
  title: string;
  secondary: string | null;
  slug: string;
  active: boolean;
  updatedAt: string;
}

export interface DashboardSummary {
  counts: {
    services: number;
    activeServices: number;
    team: number;
    activeTeam: number;
    reviews: number;
    activeReviews: number;
    enquiries: number;
    newEnquiries: number;
    pendingUserReviews: number;
    work: number;
    activeWork: number;
    visitors: number;
    visits: number;
    returningVisitors: number;
  };
  range: number;
  charts: {
    visitors: AnalyticsPoint[];
    reviews: AnalyticsPoint[];
    enquiries: AnalyticsPoint[];
  };
  latestReviews: { id: number; name: string; role: string | null; text: string; rating: number | null; active: boolean }[];
  team: { id: number; name: string; role: string; photoUrl: string | null; active: boolean }[];
  content: DashboardContentItem[];
  collectionSlugs: { workSlug: string; teamSlug: string };
}

const LATEST_REVIEWS = 3;
const TEAM_PREVIEW = 6;

function clampDays(value: number): number {
  if (!Number.isFinite(value)) return 30;
  return Math.max(7, Math.min(90, Math.trunc(value)));
}

function fillDays(rows: { date: string; visitors: number }[], days: number): AnalyticsPoint[] {
  const values = new Map(rows.map((row) => [row.date.slice(0, 10), Number(row.visitors)]));
  const result: AnalyticsPoint[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  for (let index = 0; index < days; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    result.push({ date: key, visitors: values.get(key) ?? 0 });
  }
  return result;
}

export async function getDashboardSummary(requestedDays = 30): Promise<DashboardSummary> {
  const range = clampDays(requestedDays);

  const [counts] = await query<Record<string, string>>(
    `SELECT
       (SELECT count(*) FROM services) AS services,
       (SELECT count(*) FROM services WHERE active) AS active_services,
       (SELECT count(*) FROM team_members) AS team,
       (SELECT count(*) FROM team_members WHERE active) AS active_team,
       (SELECT count(*) FROM reviews) AS reviews,
       (SELECT count(*) FROM reviews WHERE active) AS active_reviews,
       (SELECT count(*) FROM contact_submissions) AS enquiries,
       (SELECT count(*) FROM contact_submissions WHERE status = 'new') AS new_enquiries,
       (SELECT count(*) FROM user_reviews WHERE status = 'pending') AS pending_user_reviews,
       (SELECT count(*) FROM work_items) AS work,
       (SELECT count(*) FROM work_items WHERE active) AS active_work,
       (SELECT count(*) FROM site_visitors) AS visitors,
       (SELECT count(*) FROM site_visit_events) AS visits,
       (SELECT count(*) FROM site_visitors WHERE visit_count > 1) AS returning_visitors`,
  );

  const [visitorRows, reviewRows, enquiryRows, latestReviews, team, content, business] = await Promise.all([
    query<{ date: string; visitors: number }>(
      `SELECT to_char(date_trunc('day', visited_at), 'YYYY-MM-DD') AS date, count(*) AS visitors
       FROM site_visit_events
       WHERE visited_at >= current_date - ($1::integer - 1)
       GROUP BY 1
       ORDER BY 1`,
      [range],
    ),
    query<{ date: string; visitors: number }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, count(*) AS visitors
       FROM reviews
       WHERE created_at >= current_date - ($1::integer - 1)
       GROUP BY 1
       ORDER BY 1`,
      [range],
    ),
    query<{ date: string; visitors: number }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, count(*) AS visitors
       FROM contact_submissions
       WHERE created_at >= current_date - ($1::integer - 1)
       GROUP BY 1
       ORDER BY 1`,
      [range],
    ),
    query<{ id: number; name: string; role: string | null; text_en: string; rating: number | null; active: boolean }>(
      "SELECT id, name, role, text_en, rating, active FROM reviews ORDER BY created_at DESC, id DESC LIMIT $1",
      [LATEST_REVIEWS],
    ),
    query<{ id: number; name: string; role: string; photo_url: string | null; active: boolean }>(
      "SELECT id, name, role, photo_url, active FROM team_members ORDER BY sort_order ASC, id ASC LIMIT $1",
      [TEAM_PREVIEW],
    ),
    query<DashboardContentItem>(
      `SELECT * FROM (
         SELECT id::text AS id, 'services'::text AS type, name AS title, category AS secondary, slug, active, to_char(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS "updatedAt"
         FROM services
         ORDER BY updated_at DESC, id ASC
         LIMIT 24
       ) services_preview
       UNION ALL
       SELECT * FROM (
         SELECT id::text AS id, 'work'::text AS type, title, category AS secondary, slug, active, to_char(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS "updatedAt"
         FROM work_items
         ORDER BY updated_at DESC, id DESC
         LIMIT 24
       ) work_preview
       UNION ALL
       SELECT * FROM (
         SELECT id::text AS id, 'team'::text AS type, name AS title, role AS secondary, slug, active, to_char(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS "updatedAt"
         FROM team_members
         ORDER BY updated_at DESC, id DESC
         LIMIT 24
       ) team_preview
       UNION ALL
       SELECT * FROM (
         SELECT id::text AS id, 'reviews'::text AS type, name AS title, role AS secondary, slug, active, to_char(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS "updatedAt"
         FROM reviews
         ORDER BY updated_at DESC, id DESC
         LIMIT 24
       ) review_preview
       ORDER BY "updatedAt" DESC`,
    ),
    query<{ team_slug: string; work_slug: string }>(
      "SELECT team_slug, work_slug FROM business_profile WHERE id = 1 LIMIT 1",
    ),
  ]);

  return {
    counts: {
      services: Number(counts.services),
      activeServices: Number(counts.active_services),
      team: Number(counts.team),
      activeTeam: Number(counts.active_team),
      reviews: Number(counts.reviews),
      activeReviews: Number(counts.active_reviews),
      enquiries: Number(counts.enquiries),
      newEnquiries: Number(counts.new_enquiries),
      pendingUserReviews: Number(counts.pending_user_reviews),
      work: Number(counts.work),
      activeWork: Number(counts.active_work),
      visitors: Number(counts.visitors),
      visits: Number(counts.visits),
      returningVisitors: Number(counts.returning_visitors),
    },
    range,
    charts: {
      visitors: fillDays(visitorRows, range),
      reviews: fillDays(reviewRows, range),
      enquiries: fillDays(enquiryRows, range),
    },
    latestReviews: latestReviews.map((r) => ({ id: r.id, name: r.name, role: r.role, text: r.text_en, rating: r.rating == null ? null : Number(r.rating), active: r.active })),
    team: team.map((r) => ({ id: r.id, name: r.name, role: r.role, photoUrl: r.photo_url, active: r.active })),
    content: content.map((item) => ({
      id: String(item.id),
      type: item.type,
      title: item.title,
      secondary: item.secondary,
      slug: item.slug,
      active: item.active,
      updatedAt: item.updatedAt,
    })),
    collectionSlugs: {
      workSlug: business[0]?.work_slug || "our-work",
      teamSlug: business[0]?.team_slug || "our-team",
    },
  };
}

export interface VisitorQuery {
  search: string;
  device: string;
  country: string;
  returning: "all" | "returning" | "new";
  sort: keyof Pick<VisitorAnalyticsRow, "visitorId" | "firstSeenAt" | "lastSeenAt" | "visitCount" | "sessionCount" | "deviceType" | "browser" | "operatingSystem" | "country" | "city">;
  dir: "asc" | "desc";
  limit: number;
  offset: number;
}

const SORT_SQL: Record<VisitorQuery["sort"], string> = {
  visitorId: "visitor_id",
  firstSeenAt: "first_seen_at",
  lastSeenAt: "last_seen_at",
  visitCount: "visit_count",
  sessionCount: "session_count",
  deviceType: "device_type",
  browser: "browser",
  operatingSystem: "operating_system",
  country: "country",
  city: "city",
};

export async function getVisitorAnalytics(queryOptions: VisitorQuery) {
  const sortColumn = SORT_SQL[queryOptions.sort] || SORT_SQL.lastSeenAt;
  const direction = queryOptions.dir === "asc" ? "ASC" : "DESC";
  const search = `%${queryOptions.search.trim()}%`;
  const returningClause = queryOptions.returning === "returning" ? "AND visit_count > 1" : queryOptions.returning === "new" ? "AND visit_count = 1" : "";
  const deviceIndex = 4;
  const countryIndex = queryOptions.device ? 5 : 4;
  const limitIndex = 3 + (queryOptions.device ? 1 : 0) + (queryOptions.country ? 1 : 0) + 1;
  const offsetIndex = limitIndex + 1;
  const deviceClause = queryOptions.device ? `AND device_type = $${deviceIndex}` : "";
  const countryClause = queryOptions.country ? `AND country = $${countryIndex}` : "";

  const params: unknown[] = [search, search, search];
  if (queryOptions.device) params.push(queryOptions.device);
  if (queryOptions.country) params.push(queryOptions.country);
  params.push(queryOptions.limit, queryOptions.offset);

  const rows = await query<VisitorAnalyticsRow & Record<string, unknown>>(
    `SELECT
       visitor_id AS "visitorId", first_seen_at AS "firstSeenAt", last_seen_at AS "lastSeenAt",
       visit_count AS "visitCount", session_count AS "sessionCount", ip_masked AS "ipMasked",
       user_agent AS "userAgent", browser, operating_system AS "operatingSystem", device_type AS "deviceType",
       language, languages, timezone, platform, screen_width AS "screenWidth", screen_height AS "screenHeight",
       viewport_width AS "viewportWidth", viewport_height AS "viewportHeight", cookies_enabled AS "cookiesEnabled",
       country, region, city, referrer, landing_path AS "landingPath", last_path AS "lastPath",
       count(*) OVER() AS total
     FROM site_visitors
     WHERE (
       visitor_id ILIKE $1 OR COALESCE(ip_masked, '') ILIKE $2 OR COALESCE(user_agent, '') ILIKE $3 OR
       COALESCE(last_path, '') ILIKE $1 OR COALESCE(referrer, '') ILIKE $2 OR COALESCE(city, '') ILIKE $3 OR
       COALESCE(country, '') ILIKE $1 OR COALESCE(browser, '') ILIKE $2 OR COALESCE(operating_system, '') ILIKE $3
     )
     ${deviceClause} ${countryClause} ${returningClause}
     ORDER BY ${sortColumn} ${direction} NULLS LAST
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params,
  );

  const total = Number(rows[0] && (rows[0] as Record<string, unknown>).total) || 0;

  const [facets] = await query<{ devices: string[]; countries: string[] }>(
    `SELECT
       ARRAY(SELECT DISTINCT device_type FROM site_visitors WHERE device_type IS NOT NULL ORDER BY device_type) AS devices,
       ARRAY(SELECT DISTINCT country FROM site_visitors WHERE country IS NOT NULL AND trim(country) <> '' ORDER BY country) AS countries`,
  );

  return {
    total,
    rows: rows.map(({ total: _total, ...row }) => row),
    facets: {
      devices: facets?.devices ?? [],
      countries: facets?.countries ?? [],
    },
  };
}
