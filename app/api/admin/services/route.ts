import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseServiceInput, parseServiceSortOrder } from "@/lib/serviceInput";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || `service-${Date.now()}`;
}

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM services ORDER BY sort_order ASC");
  return NextResponse.json({ services: rows });
});

export const POST = withAdmin(async (request: Request) => {
  const parsed = parseServiceInput(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const s = parsed.value;

  let id = slugify(s.name);
  const existing = await queryOne("SELECT id FROM services WHERE id = $1", [id]);
  if (existing) id = `${id}-${Date.now().toString(36)}`;

  const maxOrder = await queryOne<{ max: number | null }>("SELECT MAX(sort_order) AS max FROM services");
  const sortOrder = parseServiceSortOrder((maxOrder?.max ?? 0) + 1);

  await query(
    `INSERT INTO services (id, name, name_bn, category, category_bn, description, description_bn, best_for, best_for_bn, accent, image_url, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [id, s.name, s.name_bn, s.category, s.category_bn, s.description, s.description_bn, s.best_for, s.best_for_bn, s.accent, s.image_url, sortOrder]
  );

  return NextResponse.json({ ok: true, id });
});
