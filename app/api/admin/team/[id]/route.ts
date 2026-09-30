import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query, queryOne } from "@/lib/db";
import { parseTeamInput, parseTeamSortOrder } from "@/lib/teamInput";

export const PUT = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = parseTeamInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const m = parsed.value;
  const duplicate = await queryOne("SELECT id FROM team_members WHERE slug = $1 AND id <> $2", [m.slug, id]);
  if (duplicate) return NextResponse.json({ error: "That team slug is already in use." }, { status: 409 });
  const active = body.active !== false;
  const sortOrder = parseTeamSortOrder(body.sortOrder);
  const result = await query(
    `UPDATE team_members SET slug = $1, name = $2, name_bn = $3, role = $4, role_bn = $5, bio = $6, bio_bn = $7, photo_url = $8, active = $9, sort_order = $10, updated_at = now() WHERE id = $11 RETURNING id`,
    [m.slug, m.name, m.name_bn, m.role, m.role_bn, m.bio, m.bio_bn, m.photo_url, active, sortOrder, id]
  );
  if (result.length === 0) return NextResponse.json({ error: "Team member not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (_request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  await query("DELETE FROM team_members WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
});
