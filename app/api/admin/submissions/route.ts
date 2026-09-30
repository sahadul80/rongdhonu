import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 500");
  return NextResponse.json({ submissions: rows });
});
