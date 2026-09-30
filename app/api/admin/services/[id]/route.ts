import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";
import { parseServiceInput, parseServiceSortOrder } from "@/lib/serviceInput";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = parseServiceInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const s = parsed.value;
  const active = body.active !== false;
  const sortOrder = parseServiceSortOrder(body.sortOrder);

  const result = await query(
    `UPDATE services SET name = $1, name_bn = $2, category = $3, category_bn = $4, description = $5, description_bn = $6,
       best_for = $7, best_for_bn = $8, accent = $9, image_url = $10, active = $11, sort_order = $12, updated_at = now()
     WHERE id = $13 RETURNING id`,
    [s.name, s.name_bn, s.category, s.category_bn, s.description, s.description_bn, s.best_for, s.best_for_bn, s.accent, s.image_url, active, sortOrder, id]
  );
  if (result.length === 0) return NextResponse.json({ error: "Service not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM services WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
});
