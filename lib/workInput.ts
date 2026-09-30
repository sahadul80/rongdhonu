import { isValidImageDataUri, isValidSlug } from "./formValidation";

export interface WorkInput {
  slug: string; title: string; title_bn: string | null; category: string; category_bn: string | null; description: string; description_bn: string | null; client_name: string | null; location: string | null; year: number | null; image_url: string | null;
}

export function parseWorkInput(body: unknown): { ok: true; value: WorkInput } | { ok: false; error: string } {
  const r = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
  const slug = String(r.slug ?? "").trim().slice(0,80);
  const title = String(r.title ?? "").trim().slice(0,200);
  const category = String(r.category ?? "").trim().slice(0,120);
  const description = String(r.description ?? "").trim().slice(0,1200);
  const yearRaw = String(r.year ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  const imageUrl = r.imageUrl ? String(r.imageUrl) : null;
  if (!isValidSlug(slug)) return { ok: false, error: "Work slug must use lowercase letters, numbers and single hyphens." };
  if (!title) return { ok: false, error: "Work title is required." };
  if (!category) return { ok: false, error: "Work category is required." };
  if (!description) return { ok: false, error: "Work description is required." };
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) return { ok: false, error: "Year must be a valid four-digit year." };
  if (!isValidImageDataUri(imageUrl)) return { ok: false, error: "Work image must be a supported base64 image." };
  return { ok: true, value: { slug, title, title_bn: r.titleBn ? String(r.titleBn).trim().slice(0,200) : null, category, category_bn: r.categoryBn ? String(r.categoryBn).trim().slice(0,120) : null, description, description_bn: r.descriptionBn ? String(r.descriptionBn).trim().slice(0,1200) : null, client_name: r.clientName ? String(r.clientName).trim().slice(0,160) : null, location: r.location ? String(r.location).trim().slice(0,200) : null, year, image_url: imageUrl } };
}
