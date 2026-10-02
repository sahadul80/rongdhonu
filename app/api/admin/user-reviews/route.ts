import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";

export const GET = withAdmin(async () => {
  const rows = await query(`
    SELECT ur.id, ur.work_id, ur.name, ur.email, ur.rating, ur.review_text, ur.status, ur.created_at, ur.updated_at,
           w.title AS work_title, w.slug AS work_slug
    FROM user_reviews ur
    LEFT JOIN work_items w ON w.id = ur.work_id
    ORDER BY CASE ur.status WHEN 'pending' THEN 0 WHEN 'visible' THEN 1 ELSE 2 END, ur.created_at DESC, ur.id DESC
    LIMIT 500
  `);
  return NextResponse.json({ reviews: rows });
});

export const PATCH = withAdmin(async (request: Request) => {
  const body = await request.json();
  const id = Number(body.id);
  const status = String(body.status ?? "");
  if (!Number.isInteger(id) || id <= 0 || !["visible", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Only show/hide status changes are allowed for website reviews." }, { status: 400 });
  }
  const rows = await query("UPDATE user_reviews SET status=$1, updated_at=now() WHERE id=$2 RETURNING id,status", [status, id]);
  if (!rows.length) return NextResponse.json({ error: "User review not found." }, { status: 404 });
  return NextResponse.json({ ok: true, review: rows[0] });
});
