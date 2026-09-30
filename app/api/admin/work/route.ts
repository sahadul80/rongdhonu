import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseWorkInput } from "@/lib/workInput";

export const GET = withAdmin(async () => NextResponse.json({ work: await query("SELECT * FROM work_items ORDER BY sort_order ASC, id ASC") }));

export const POST = withAdmin(async (request: Request) => {
  const parsed = parseWorkInput(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const w = parsed.value;
  if (await queryOne("SELECT id FROM work_items WHERE slug = $1", [w.slug])) return NextResponse.json({ error: "That work slug is already in use." }, { status: 409 });
  const max = await queryOne<{ max: number | null }>("SELECT MAX(sort_order) AS max FROM work_items");
  const created = await query<{ id: number }>(`INSERT INTO work_items (slug, title, title_bn, category, category_bn, description, description_bn, client_name, location, year, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`, [w.slug,w.title,w.title_bn,w.category,w.category_bn,w.description,w.description_bn,w.client_name,w.location,w.year,w.image_url,Number(max?.max ?? 0)+1]);
  return NextResponse.json({ ok: true, id: created[0]?.id });
});
