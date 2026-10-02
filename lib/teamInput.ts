import { isValidImageDataUri, isValidSlug, parseSortOrder, validateSortOrder, type ValidationResult } from "./formValidation";
import { slugify } from "./slug";

export interface TeamInput {
  slug: string; name: string; name_bn: string | null; role: string; role_bn: string | null; bio: string | null; bio_bn: string | null; photo_url: string | null;
}

export function parseTeamInput(body: unknown): { ok: true; value: TeamInput } | { ok: false; error: string } {
  const record = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  const name = String(record.name ?? "").trim().slice(0, 160);
  const slug = slugify(String(record.slug ?? ""), "team").slice(0, 80);
  const role = String(record.role ?? "").trim().slice(0, 120);
  const nameBn = record.nameBn ? String(record.nameBn).trim().slice(0, 160) : null;
  const roleBn = record.roleBn ? String(record.roleBn).trim().slice(0, 120) : null;
  const bio = record.bio ? String(record.bio).trim().slice(0, 800) : null;
  const bioBn = record.bioBn ? String(record.bioBn).trim().slice(0, 800) : null;
  const photoUrl = record.photoUrl ? String(record.photoUrl) : null;
  if (!isValidSlug(slug)) return { ok: false, error: "Team slug must use lowercase letters, numbers and single hyphens." };
  if (!name) return { ok: false, error: "Team member name is required." };
  if (!role) return { ok: false, error: "Team member role is required." };
  if (!isValidImageDataUri(photoUrl)) return { ok: false, error: "Team photo must be a supported base64 image." };
  return { ok: true, value: { slug, name, name_bn: nameBn, role, role_bn: roleBn, bio, bio_bn: bioBn, photo_url: photoUrl } };
}

export function parseTeamSortOrder(value: unknown): number {
  const check: ValidationResult = validateSortOrder(value);
  return check.ok ? parseSortOrder(value) : 0;
}
