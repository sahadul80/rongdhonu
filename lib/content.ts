import "server-only";
import { query, queryOne } from "./db";
import { neonTableGet } from "./neon-data-api";

export interface BusinessProfile {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  addressBn: string | null;
  mapQuery: string;
  logoUrl: string | null;
  logoReversedUrl: string | null;
  iconUrl: string | null;
  teamSlug: string;
  workSlug: string;
  hasTeam: boolean;
  hasWork: boolean;
}

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  nameBn: string | null;
  category: string;
  categoryBn: string | null;
  description: string;
  descriptionBn: string | null;
  bestFor: string;
  bestForBn: string | null;
  accent: string;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface ReviewRow {
  id: number;
  slug: string;
  name: string;
  role: string | null;
  roleBn: string | null;
  textEn: string;
  textBn: string | null;
  rating: number | null;
  workId: number | null;
  workSlug: string | null;
  workTitle: string | null;
  workTitleBn: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  source?: "admin" | "user";
  isPublic?: boolean;
}

export interface TeamMemberRow {
  id: number;
  slug: string;
  name: string;
  nameBn: string | null;
  role: string;
  roleBn: string | null;
  bio: string | null;
  bioBn: string | null;
  photoUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface WorkRow {
  id: number;
  slug: string;
  title: string;
  titleBn: string | null;
  category: string;
  categoryBn: string | null;
  description: string;
  descriptionBn: string | null;
  clientName: string | null;
  location: string | null;
  year: number | null;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface HeroImageRow {
  slot: string;
  label: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ContactSubmissionRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  serviceInterest: string | null;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

const str = (v: unknown): string | null => {
  if (v == null) return null;
  const value = String(v).trim();
  return value ? value : null;
};
const safe = (v: unknown): string => str(v) ?? "";

async function publicRows<T extends Record<string, unknown>>(
  table: string,
  params: Record<string, string | number | boolean | undefined>,
  sql: string,
  sqlParams: unknown[] = [],
): Promise<T[]> {
  try {
    const neonRows = await neonTableGet<T>(table, params);
    if (neonRows) return neonRows;
  } catch (error) {
    console.warn(`Neon Data API read failed for ${table}; falling back to PostgreSQL.`, error);
  }
  return query<T>(sql, sqlParams);
}

async function publicRow<T extends Record<string, unknown>>(
  table: string,
  params: Record<string, string | number | boolean | undefined>,
  sql: string,
  sqlParams: unknown[] = [],
): Promise<T | null> {
  const rows = await publicRows<T>(table, params, sql, sqlParams);
  return rows[0] ?? null;
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const row = await publicRow<Record<string, unknown>>(
    "business_profile",
    { id: "eq.1", limit: 1, select: "*" },
    "SELECT * FROM business_profile WHERE id = 1",
  );
  if (!row) return null;
  return {
    name: safe(row.name),
    shortName: safe(row.short_name),
    tagline: safe(row.tagline),
    phone: safe(row.phone),
    email: safe(row.email),
    website: safe(row.website),
    address: safe(row.address),
    addressBn: str(row.address_bn),
    mapQuery: (() => {
      const address = safe(row.address);
      const saved = safe(row.map_query);
      const businessName = safe(row.name);
      if (!saved) return `${businessName}, ${address}`.trim();
      return saved.toLowerCase().includes(businessName.toLowerCase()) ? saved : `${businessName}, ${saved}`;
    })(),
    logoUrl: str(row.logo_url),
    logoReversedUrl: str(row.logo_reversed_url),
    iconUrl: str(row.icon_url),
    teamSlug: safe(row.team_slug) || "our-team",
    workSlug: safe(row.work_slug) || "our-work",
    hasTeam: Boolean(row.has_team),
    hasWork: Boolean(row.has_work),
  };
}

export async function getActiveServices(): Promise<ServiceRow[]> {
  const rows = await publicRows<Record<string, unknown>>(
    "services",
    { active: "is.true", order: "sort_order.asc", select: "*" },
    "SELECT * FROM services WHERE active = true ORDER BY sort_order ASC",
  );
  return rows.map((r) => ({
    id: String(r.id),
    slug: safe(r.slug) || String(r.id),
    name: safe(r.name),
    nameBn: str(r.name_bn),
    category: safe(r.category),
    categoryBn: str(r.category_bn),
    description: safe(r.description),
    descriptionBn: str(r.description_bn),
    bestFor: safe(r.best_for),
    bestForBn: str(r.best_for_bn),
    accent: safe(r.accent),
    imageUrl: str(r.image_url),
    sortOrder: Number(r.sort_order),
    active: Boolean(r.active),
  }));
}

export async function getActiveReviews(): Promise<ReviewRow[]> {
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM (
       SELECT r.id::text AS source_id, r.id::bigint AS id, 'admin'::text AS source, r.slug, r.name, r.role, r.role_bn,
              r.text_en, r.text_bn, r.rating, r.work_id, r.sort_order, r.active, r.created_at, r.updated_at,
              w.slug AS work_slug, w.title AS work_title, w.title_bn AS work_title_bn
       FROM reviews r
       LEFT JOIN work_items w ON w.id = r.work_id
       WHERE r.active = true
       UNION ALL
       SELECT ur.id::text AS source_id, ur.id::bigint AS id, 'user'::text AS source, NULL::text AS slug, ur.name, NULL::text AS role, NULL::text AS role_bn,
              ur.review_text AS text_en, NULL::text AS text_bn, ur.rating, ur.work_id, 100000::integer + ur.id::integer AS sort_order,
              true AS active, ur.created_at, ur.updated_at, w.slug AS work_slug, w.title AS work_title, w.title_bn AS work_title_bn
       FROM user_reviews ur
       JOIN work_items w ON w.id = ur.work_id
       WHERE ur.status = 'visible' AND w.active = true
     ) published_reviews
     ORDER BY created_at DESC, id DESC`,
  );
  return rows.map((r) => ({
    id: Number(r.id), slug: safe(r.source) === "user" ? `user-review-${Number(r.id)}` : (safe(r.slug) || `review-${Number(r.id)}`),
    name: safe(r.name), role: str(r.role), roleBn: str(r.role_bn), textEn: safe(r.text_en), textBn: str(r.text_bn),
    rating: r.rating == null ? null : Number(r.rating), workId: r.work_id == null ? null : Number(r.work_id),
    workSlug: str(r.work_slug), workTitle: str(r.work_title), workTitleBn: str(r.work_title_bn), sortOrder: Number(r.sort_order),
    active: Boolean(r.active), createdAt: String(r.created_at ?? r.updated_at ?? ""), source: safe(r.source) as "admin" | "user", isPublic: true,
  }));
}

export async function getActiveTeam(): Promise<TeamMemberRow[]> {
  const rows = await publicRows<Record<string, unknown>>(
    "team_members",
    { active: "is.true", order: "sort_order.asc,id.asc", select: "*" },
    "SELECT * FROM team_members WHERE active = true ORDER BY sort_order ASC, id ASC",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    slug: safe(r.slug) || `team-${Number(r.id)}`,
    name: safe(r.name),
    nameBn: str(r.name_bn),
    role: safe(r.role),
    roleBn: str(r.role_bn),
    bio: str(r.bio),
    bioBn: str(r.bio_bn),
    photoUrl: str(r.photo_url),
    sortOrder: Number(r.sort_order),
    active: Boolean(r.active),
  }));
}

export async function getActiveWork(): Promise<WorkRow[]> {
  const rows = await publicRows<Record<string, unknown>>(
    "work_items",
    { active: "is.true", order: "sort_order.asc,id.asc", select: "*" },
    "SELECT * FROM work_items WHERE active = true ORDER BY sort_order ASC, id ASC",
  );
  return rows.map((r) => ({
    id: Number(r.id),
    slug: safe(r.slug),
    title: safe(r.title),
    titleBn: str(r.title_bn),
    category: safe(r.category),
    categoryBn: str(r.category_bn),
    description: safe(r.description),
    descriptionBn: str(r.description_bn),
    clientName: str(r.client_name),
    location: str(r.location),
    year: r.year == null ? null : Number(r.year),
    imageUrl: str(r.image_url),
    sortOrder: Number(r.sort_order),
    active: Boolean(r.active),
  }));
}

export async function getWorkBySlug(slug: string): Promise<WorkRow | null> {
  const row = await publicRow<Record<string, unknown>>(
    "work_items",
    { slug: `eq.${slug}`, active: "is.true", limit: 1, select: "*" },
    "SELECT * FROM work_items WHERE slug = $1 AND active = true",
    [slug],
  );
  if (!row) return null;
  return {
    id: Number(row.id), slug: safe(row.slug), title: safe(row.title), titleBn: str(row.title_bn),
    category: safe(row.category), categoryBn: str(row.category_bn), description: safe(row.description),
    descriptionBn: str(row.description_bn), clientName: str(row.client_name), location: str(row.location),
    year: row.year == null ? null : Number(row.year), imageUrl: str(row.image_url),
    sortOrder: Number(row.sort_order), active: Boolean(row.active),
  };
}

export async function getTeamBySlug(slug: string): Promise<TeamMemberRow | null> {
  const row = await publicRow<Record<string, unknown>>(
    "team_members",
    { slug: `eq.${slug}`, active: "is.true", limit: 1, select: "*" },
    "SELECT * FROM team_members WHERE slug = $1 AND active = true",
    [slug],
  );
  if (!row) return null;
  return {
    id: Number(row.id), slug: safe(row.slug) || `team-${Number(row.id)}`, name: safe(row.name), nameBn: str(row.name_bn),
    role: safe(row.role), roleBn: str(row.role_bn), bio: str(row.bio), bioBn: str(row.bio_bn), photoUrl: str(row.photo_url),
    sortOrder: Number(row.sort_order), active: Boolean(row.active),
  };
}

export async function getReviewsForWork(workId: number): Promise<ReviewRow[]> {
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM (
       SELECT r.id::bigint AS id, 'admin'::text AS source, r.slug, r.name, r.role, r.role_bn, r.text_en, r.text_bn, r.rating,
              r.work_id, r.sort_order, r.active, r.created_at, r.updated_at, w.slug AS work_slug, w.title AS work_title, w.title_bn AS work_title_bn
       FROM reviews r
       JOIN work_items w ON w.id = r.work_id
       WHERE r.active = true AND r.work_id = $1
       UNION ALL
       SELECT ur.id::bigint AS id, 'user'::text AS source, NULL::text AS slug, ur.name, NULL::text AS role, NULL::text AS role_bn,
              ur.review_text AS text_en, NULL::text AS text_bn, ur.rating, ur.work_id, 100000::integer + ur.id::integer AS sort_order, true AS active,
              ur.created_at, ur.updated_at, w.slug AS work_slug, w.title AS work_title, w.title_bn AS work_title_bn
       FROM user_reviews ur
       JOIN work_items w ON w.id = ur.work_id
       WHERE ur.work_id = $1 AND ur.status = 'visible'
     ) related_reviews
     ORDER BY CASE WHEN source = 'admin' THEN 0 ELSE 1 END, created_at DESC, id DESC`,
    [workId],
  );
  return rows.map((r) => ({
    id: Number(r.id), slug: safe(r.slug) || `user-review-${Number(r.id)}`, name: safe(r.name), role: str(r.role), roleBn: str(r.role_bn),
    textEn: safe(r.text_en), textBn: str(r.text_bn), rating: r.rating == null ? null : Number(r.rating), workId: r.work_id == null ? null : Number(r.work_id),
    workSlug: str(r.work_slug), workTitle: str(r.work_title), workTitleBn: str(r.work_title_bn), sortOrder: Number(r.sort_order), active: Boolean(r.active),
    createdAt: String(r.created_at ?? r.updated_at ?? ""), source: safe(r.source) as "admin" | "user", isPublic: true,
  }));
}

export async function getServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const row = await queryOne<Record<string, unknown>>(
    "SELECT * FROM services WHERE (slug = $1 OR id = $1) AND active = true LIMIT 1",
    [slug],
  );
  if (!row) return null;
  return {
    id: String(row.id), slug: safe(row.slug) || String(row.id), name: safe(row.name), nameBn: str(row.name_bn),
    category: safe(row.category), categoryBn: str(row.category_bn), description: safe(row.description), descriptionBn: str(row.description_bn),
    bestFor: safe(row.best_for), bestForBn: str(row.best_for_bn), accent: safe(row.accent), imageUrl: str(row.image_url),
    sortOrder: Number(row.sort_order), active: Boolean(row.active),
  };
}

export async function getReviewBySlug(slug: string): Promise<ReviewRow | null> {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT r.*, w.slug AS work_slug, w.title AS work_title, w.title_bn AS work_title_bn
     FROM reviews r
     LEFT JOIN work_items w ON w.id = r.work_id
     WHERE (r.slug = $1 OR (r.slug IS NULL AND 'review-' || r.id = $1)) AND r.active = true
     LIMIT 1`,
    [slug],
  );
  if (!row) return null;
  return {
    id: Number(row.id), slug: safe(row.slug) || `review-${Number(row.id)}`, name: safe(row.name), role: str(row.role), roleBn: str(row.role_bn),
    textEn: safe(row.text_en), textBn: str(row.text_bn), rating: row.rating == null ? null : Number(row.rating),
    workId: row.work_id == null ? null : Number(row.work_id), workSlug: str(row.work_slug), workTitle: str(row.work_title), workTitleBn: str(row.work_title_bn),
    sortOrder: Number(row.sort_order), active: Boolean(row.active), createdAt: String(row.created_at ?? row.updated_at ?? ""),
  };
}

export async function getHeroImages(): Promise<HeroImageRow[]> {
  const rows = await publicRows<Record<string, unknown>>(
    "hero_images",
    { order: "sort_order.asc", select: "*" },
    "SELECT * FROM hero_images ORDER BY sort_order ASC",
  );
  return rows.map((r) => ({
    slot: String(r.slot),
    label: safe(r.label),
    imageUrl: str(r.image_url),
    sortOrder: Number(r.sort_order),
  }));
}

import type { BusinessPublicSummary } from "@/app/types/public-cms";

export async function getBusinessPublicSummary(): Promise<BusinessPublicSummary | null> {
  const row = await publicRow<Record<string, unknown>>(
    "business_profile",
    { id: "eq.1", limit: 1, select: "name,short_name,tagline,team_slug,work_slug" },
    "SELECT name, short_name, tagline, team_slug, work_slug FROM business_profile WHERE id = 1",
  );
  if (!row) return null;

  const [teamRows, workRows] = await Promise.all([
    publicRows<Record<string, unknown>>(
      "team_members",
      { active: "is.true", select: "id", limit: 1 },
      "SELECT id FROM team_members WHERE active = true LIMIT 1",
    ),
    publicRows<Record<string, unknown>>(
      "work_items",
      { active: "is.true", select: "id", limit: 1 },
      "SELECT id FROM work_items WHERE active = true LIMIT 1",
    ),
  ]);

  return {
    name: safe(row.name),
    shortName: safe(row.short_name),
    tagline: safe(row.tagline),
    teamSlug: safe(row.team_slug) || "our-team",
    workSlug: safe(row.work_slug) || "our-work",
    hasTeam: teamRows.length > 0,
    hasWork: workRows.length > 0,
  };
}

export async function getPrimaryHeroImage(): Promise<HeroImageRow | null> {
  const rows = await publicRows<Record<string, unknown>>(
    "hero_images",
    { image_url: "not.is.null", order: "sort_order.asc", select: "slot,label,image_url,sort_order" },
    "SELECT slot, label, image_url, sort_order FROM hero_images WHERE image_url IS NOT NULL AND image_url <> '' ORDER BY CASE WHEN slot = 'banner' THEN 1 ELSE 0 END, sort_order ASC",
  );
  const row = rows.filter((item) => String(item.image_url ?? "").trim())[0] ?? null;
  if (!row) return null;
  return {
    slot: String(row.slot),
    label: safe(row.label),
    imageUrl: str(row.image_url),
    sortOrder: Number(row.sort_order),
  };
}
