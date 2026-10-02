import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { validateReviewForm, validateSortOrder, parseSortOrder } from "@/lib/formValidation";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const slug = String(body.slug ?? "").trim().slice(0, 80);
  const name = String(body.name ?? "").trim().slice(0, 160);
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
  const active = body.active !== false;
  const sortCheck = validateSortOrder(body.sortOrder);
  if (!sortCheck.ok) return NextResponse.json({ error: sortCheck.message }, { status: 400 });
  const sortOrder = parseSortOrder(body.sortOrder);

  if (await queryOne("SELECT id FROM reviews WHERE slug = $1 AND id <> $2", [slug, id])) return NextResponse.json({ error: "That review slug is already in use." }, { status: 409 });
  if (workId !== null && (!Number.isInteger(workId) || workId < 1)) return NextResponse.json({ error: "Related work is invalid." }, { status: 400 });
  if (workId !== null && !(await queryOne("SELECT id FROM work_items WHERE id = $1", [workId]))) return NextResponse.json({ error: "Related work was not found." }, { status: 400 });

  const validation = validateReviewForm({ slug, name, role: role ?? "", roleBn: roleBn ?? "", textEn, textBn: textBn ?? "", rating });
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const result = await query(
    `UPDATE reviews SET slug=$1, name=$2, role=$3, role_bn=$4, text_en=$5, text_bn=$6, rating=$7, work_id=$8, active=$9, sort_order=$10, updated_at=now()
     WHERE id=$11 RETURNING id`,
    [slug, name, role, roleBn, textEn, textBn, rating, Number.isFinite(workId) ? workId : null, active, sortOrder, id],
  );
  if (result.length === 0) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM reviews WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
});
