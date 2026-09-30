import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";
import { validateReviewForm, validateSortOrder, parseSortOrder } from "@/lib/formValidation";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const name = String(body.name ?? "").trim().slice(0, 160);
  const role = body.role ? String(body.role).trim().slice(0, 100) : null;
  const roleBn = body.roleBn ? String(body.roleBn).trim().slice(0, 100) : null;
  const textEn = String(body.textEn ?? "").trim().slice(0, 1000);
  const textBn = body.textBn ? String(body.textBn).trim().slice(0, 1000) : null;
  const workId = body.workId ? Number(body.workId) : null;
  const active = body.active !== false;
  const sortCheck = validateSortOrder(body.sortOrder);
  if (!sortCheck.ok) return NextResponse.json({ error: sortCheck.message }, { status: 400 });
  const sortOrder = parseSortOrder(body.sortOrder);

  if (workId !== null && (!Number.isInteger(workId) || workId < 1)) return NextResponse.json({ error: "Related work is invalid." }, { status: 400 });
  if (workId !== null && !(await queryOne("SELECT id FROM work_items WHERE id = $1", [workId]))) return NextResponse.json({ error: "Related work was not found." }, { status: 400 });
  const validation = validateReviewForm({ name, role: role ?? "", roleBn: roleBn ?? "", textEn, textBn: textBn ?? "" });
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const result = await query(
    `UPDATE reviews SET name = $1, role = $2, role_bn = $3, text_en = $4, text_bn = $5, work_id = $6, active = $7, sort_order = $8, updated_at = now()
     WHERE id = $8 RETURNING id`,
    [name, role, roleBn, textEn, textBn, Number.isFinite(workId) ? workId : null, active, sortOrder, id]
  );
  if (result.length === 0) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM reviews WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
});
