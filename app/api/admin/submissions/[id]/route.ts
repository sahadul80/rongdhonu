import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";

const STATUSES = new Set(["new", "read", "archived"]);

export const PATCH = withAdmin(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "");
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "status must be one of: new, read, archived." }, { status: 400 });
  }
  const result = await query("UPDATE contact_submissions SET status = $1 WHERE id = $2 RETURNING id", [status, id]);
  if (result.length === 0) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
});
