import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseServiceInput, parseServiceSortOrder } from "@/lib/serviceInput";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = parseServiceInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const s = parsed.value;
  const duplicate = await queryOne("SELECT id FROM services WHERE slug = $1 AND id <> $2", [s.slug, id]);
  if (duplicate) return NextResponse.json({ error: "That service slug is already in use." }, { status: 409 });

  const active = body.active !== false;
  const sortOrder = parseServiceSortOrder(body.sortOrder);
  const result = await query(
    `UPDATE services SET slug=$1, name=$2, name_bn=$3, category=$4, category_bn=$5, description=$6, description_bn=$7,
      best_for=$8, best_for_bn=$9, accent=$10, image_url=$11, active=$12, sort_order=$13, updated_at=now()
     WHERE id=$14 RETURNING id`,
    [s.slug, s.name, s.name_bn, s.category, s.category_bn, s.description, s.description_bn, s.best_for, s.best_for_bn, s.accent, s.image_url, active, sortOrder, id],
  );
  if (!result.length) return NextResponse.json({ error: "Service not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM services WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
});
