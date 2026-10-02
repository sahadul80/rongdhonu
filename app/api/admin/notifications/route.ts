import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { queryOne } from "@/lib/db";

export const GET = withAdmin(async () => {
  const counts = await queryOne<Record<string, string>>(`
    SELECT
      (SELECT count(*) FROM user_reviews WHERE status='pending') AS pending_reviews,
      (SELECT count(*) FROM contact_submissions WHERE status='new') AS new_enquiries
  `);
  return NextResponse.json({ pendingReviews: Number(counts?.pending_reviews ?? 0), newEnquiries: Number(counts?.new_enquiries ?? 0) }, { headers: { "Cache-Control": "private, no-store" } });
});
