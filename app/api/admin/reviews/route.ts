import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { validateReviewForm, validateSortOrder, parseSortOrder } from "@/lib/formValidation";

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70) || `review-${Date.now()}`;
}

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM reviews ORDER BY sort_order ASC, id ASC");
  return NextResponse.json({ reviews: rows });
});

export const POST = withAdmin(async (request: Request) => {
  const body = await request.json();
  const name = String(body.name ?? "").trim().slice(0, 160);
  const requestedSlug = String(body.slug ?? "").trim().slice(0, 80);
  const slug = requestedSlug || `${slugify(name)}-${Date.now().toString(36).slice(-5)}`;
  const role = body.role ? String(body.role).trim().slice(0, 100) : null;
  const roleBn = body.roleBn ? String(body.roleBn).trim().slice(0, 100) : null;
  const textEn = String(body.textEn ?? "").trim().slice(0, 1000);
  const textBn = body.textBn ? String(body.textBn).trim().slice(0, 1000) : null;
  const rawRating = body.rating;
  let rating: number | null = null;
  if (rawRating !== "" && rawRating != null) {
    const parsedRating = typeof rawRating === "number" ? rawRating : Number(String(rawRating).trim());
    if (!Number.isFinite(parsedRating)) {
      return NextResponse.json({ error: "Rating must be a number from 0 to 5." }, { status: 400 });
    }
    rating = Math.round(parsedRating * 10) / 10;
  }
  const workId = body.workId ? Number(body.workId) : null;

  if (await queryOne("SELECT id FROM reviews WHERE slug = $1", [slug])) return NextResponse.json({ error: "That review slug is already in use." }, { status: 409 });
  if (workId !== null && (!Number.isInteger(workId) || workId < 1)) return NextResponse.json({ error: "Related work is invalid." }, { status: 400 });
  if (workId !== null && !(await queryOne("SELECT id FROM work_items WHERE id = $1", [workId]))) return NextResponse.json({ error: "Related work was not found." }, { status: 400 });

  const validation = validateReviewForm({ slug, name, role: role ?? "", roleBn: roleBn ?? "", textEn, textBn: textBn ?? "", rating });
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const maxOrder = await queryOne<{ max: number | null }>("SELECT MAX(sort_order) AS max FROM reviews");
  const sortOrder = (maxOrder?.max ?? 0) + 1;

  const created = await query<{ id: number }>(
    `INSERT INTO reviews (slug, name, role, role_bn, text_en, text_bn, rating, work_id, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [slug, name, role, roleBn, textEn, textBn, rating, Number.isFinite(workId) ? workId : null, sortOrder],
  );

  return NextResponse.json({ ok: true, id: created[0]?.id, slug });
});
