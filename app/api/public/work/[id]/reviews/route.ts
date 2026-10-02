import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { getReviewsForWork } from "@/lib/content";
import { query } from "@/lib/db";
import { ownerCookieName } from "@/lib/userReviews";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const workId = Number((await context.params).id);
  if (!Number.isInteger(workId) || workId <= 0) return NextResponse.json({ error: "Invalid work id." }, { status: 400 });
  try {
    const publicReviews = await getReviewsForWork(workId);
    const store = await cookies();
    const ownerRows = await query<Record<string, unknown>>(
      `SELECT id, name, email, rating, review_text, status, created_at, updated_at, owner_token_hash
       FROM user_reviews WHERE work_id=$1 ORDER BY created_at DESC, id DESC`,
      [workId],
    );
    const ownerIds = new Set<number>();
    const ownerEmails = new Map<number, string>();
    const privateOwned: Array<Record<string, unknown>> = [];
    for (const row of ownerRows) {
      const id = Number(row.id);
      const token = store.get(ownerCookieName(id))?.value;
      const hash = String(row.owner_token_hash ?? "");
      if (!token || !hash || createHash("sha256").update(token).digest("hex") !== hash) continue;
      ownerIds.add(id);
      ownerEmails.set(id, String(row.email ?? ""));
      if (publicReviews.some((review) => review.id === id && review.source === "user")) continue;
      privateOwned.push({
        id, slug: `user-review-${id}`, name: String(row.name ?? ""), role: null, roleBn: null,
        textEn: String(row.review_text ?? ""), textBn: null, rating: row.rating == null ? null : Number(row.rating), workId,
        workSlug: null, workTitle: null, workTitleBn: null, sortOrder: 100000 + id, active: true,
        createdAt: String(row.created_at ?? row.updated_at ?? ""), source: "user", isPublic: row.status === "visible", canManage: true, ownerEmail: String(row.email ?? ""),
      });
    }
    const reviews = [...publicReviews.map((review) => ({ ...review, canManage: review.source === "user" && ownerIds.has(review.id), isPublic: true, ownerEmail: review.source === "user" && ownerIds.has(review.id) ? ownerEmails.get(review.id) : undefined })), ...privateOwned];
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Failed to load related work reviews:", error);
    return NextResponse.json({ error: "Related reviews temporarily unavailable." }, { status: 503 });
  }
}
