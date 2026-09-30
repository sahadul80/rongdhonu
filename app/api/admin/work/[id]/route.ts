import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseSortOrder, validateSortOrder } from "@/lib/formValidation";
import { parseWorkInput } from "@/lib/workInput";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = parseWorkInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const orderCheck = validateSortOrder(body.sortOrder);
  if (!orderCheck.ok) return NextResponse.json({ error: orderCheck.message }, { status: 400 });
  const w = parsed.value;
  if (await queryOne("SELECT id FROM work_items WHERE slug = $1 AND id <> $2", [w.slug, id])) {
    return NextResponse.json({ error: "That work slug is already in use." }, { status: 409 });
  }
  const result = await query(
    `UPDATE work_items SET slug=$1,title=$2,title_bn=$3,category=$4,category_bn=$5,description=$6,description_bn=$7,
      client_name=$8,location=$9,year=$10,image_url=$11,active=$12,sort_order=$13,updated_at=now()
     WHERE id=$14 RETURNING id`,
    [w.slug, w.title, w.title_bn, w.category, w.category_bn, w.description, w.description_bn, w.client_name, w.location, w.year, w.image_url, body.active !== false, parseSortOrder(body.sortOrder), id],
  );
  if (!result.length) return NextResponse.json({ error: "Work item not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM work_items WHERE id=$1", [id]);
  return NextResponse.json({ ok: true });
});
