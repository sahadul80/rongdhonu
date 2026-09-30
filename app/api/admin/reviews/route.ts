import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { validateReviewForm, validateSortOrder, parseSortOrder } from "@/lib/formValidation";

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM reviews ORDER BY sort_order ASC");
  return NextResponse.json({ reviews: rows });
});

export const POST = withAdmin(async (request: Request) => {
  const body = await request.json();
  const name = String(body.name ?? "").trim().slice(0, 160);
  const role = body.role ? String(body.role).trim().slice(0, 100) : null;
  const roleBn = body.roleBn ? String(body.roleBn).trim().slice(0, 100) : null;
  const textEn = String(body.textEn ?? "").trim().slice(0, 1000);
  const textBn = body.textBn ? String(body.textBn).trim().slice(0, 1000) : null;
  const workId = body.workId ? Number(body.workId) : null;
  if (workId !== null && (!Number.isInteger(workId) || workId < 1)) return NextResponse.json({ error: "Related work is invalid." }, { status: 400 });
  if (workId !== null && !(await queryOne("SELECT id FROM work_items WHERE id = $1", [workId]))) return NextResponse.json({ error: "Related work was not found." }, { status: 400 });
  const validation = validateReviewForm({ name, role: role ?? "", roleBn: roleBn ?? "", textEn, textBn: textBn ?? "" });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const maxOrder = await queryOne<{ max: number | null }>("SELECT MAX(sort_order) AS max FROM reviews");
  const sortOrder = (maxOrder?.max ?? 0) + 1;

  const created = await query<{ id: number }>(
    `INSERT INTO reviews (name, role, role_bn, text_en, text_bn, work_id, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, role, roleBn, textEn, textBn, Number.isFinite(workId) ? workId : null, sortOrder]
  );

  return NextResponse.json({ ok: true, id: created[0]?.id });
});
