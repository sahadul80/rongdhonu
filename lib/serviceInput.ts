import { isValidImageDataUri, isValidSlug, parseSortOrder, validateSortOrder } from "./formValidation";
import { slugify } from "./slug";

const ACCENTS = new Set(["red", "orange", "amber", "green", "teal", "blue", "purple", "pink"]);

export interface ServiceInput {
  slug: string;
  name: string;
  name_bn: string | null;
  category: string;
  category_bn: string | null;
  description: string;
  description_bn: string | null;
  best_for: string;
  best_for_bn: string | null;
  accent: string;
  image_url: string | null;
}

export function parseServiceInput(body: Record<string, unknown>): { ok: true; value: ServiceInput } | { ok: false; error: string } {
  const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const optional = (value: unknown, max: number) => {
    const valueText = text(value, max);
    return valueText ? valueText : null;
  };

  const name = text(body.name, 200);
  const slug = slugify(text(body.slug, 80), "service").slice(0, 80);
  const category = text(body.category, 100);
  const description = text(body.description, 1000);
  if (!name || !category || !description) return { ok: false, error: "Name, category and description are required." };
  if (!isValidSlug(slug)) return { ok: false, error: "Service slug must use lowercase letters, numbers and single hyphens." };

  const sortOrder = validateSortOrder(body.sortOrder);
  if (!sortOrder.ok) return { ok: false, error: sortOrder.message };

  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  if (!isValidImageDataUri(imageUrl)) return { ok: false, error: "Image must be a PNG, JPG or WebP base64 data URI." };

  return {
    ok: true,
    value: {
      slug,
      name,
      name_bn: optional(body.nameBn, 200),
      category,
      category_bn: optional(body.categoryBn, 100),
      description,
      description_bn: optional(body.descriptionBn, 1000),
      best_for: text(body.bestFor, 200),
      best_for_bn: optional(body.bestForBn, 200),
      accent: ACCENTS.has(String(body.accent)) ? String(body.accent) : "red",
      image_url: imageUrl,
    },
  };
}

export function parseServiceSortOrder(value: unknown): number {
  return parseSortOrder(value);
}
