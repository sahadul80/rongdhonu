import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseTeamInput, parseTeamSortOrder } from "@/lib/teamInput";

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM team_members ORDER BY sort_order ASC, id ASC");
  return NextResponse.json({ team: rows });
});

export const POST = withAdmin(async (request: Request) => {
  const parsed = parseTeamInput(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const m = parsed.value;
  const existing = await queryOne("SELECT id FROM team_members WHERE slug = $1", [m.slug]);
  if (existing) return NextResponse.json({ error: "That team slug is already in use." }, { status: 409 });
  const maxOrder = await queryOne<{ max: number | null }>("SELECT MAX(sort_order) AS max FROM team_members");
  const sortOrder = parseTeamSortOrder((maxOrder?.max ?? 0) + 1);
  const created = await query<{ id: number }>(
    `INSERT INTO team_members (slug, name, name_bn, role, role_bn, bio, bio_bn, photo_url, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [m.slug, m.name, m.name_bn, m.role, m.role_bn, m.bio, m.bio_bn, m.photo_url, sortOrder]
  );
  return NextResponse.json({ ok: true, id: created[0]?.id });
});
