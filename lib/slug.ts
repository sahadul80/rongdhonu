export function slugify(value: string, fallback = "item"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return slug || fallback;
}

export function ensureSlug(value: unknown, source: string, fallback = "item"): string {
  const explicit = typeof value === "string" ? value.trim() : "";
  return slugify(explicit || source, fallback);
}
