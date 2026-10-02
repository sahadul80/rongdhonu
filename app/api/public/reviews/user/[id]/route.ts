import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { clearOwnerCookie, hasOwnerAccess } from "@/lib/userReviews";
import { isSameOriginRequest } from "@/lib/publicRequest";
import { CONSENT_VERSION, getPublicProfile, setPublicProfileCookie } from "@/lib/publicProfile";

function clean(value: unknown, max: number): string { return String(value ?? "").trim().slice(0, max); }

async function owned(id: number) {
  const row = await queryOne<{ id: number; owner_token_hash: string }>("SELECT id, owner_token_hash FROM user_reviews WHERE id = $1", [id]);
  if (!row || !(await hasOwnerAccess(id, row.owner_token_hash))) return null;
  return row;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request is not allowed." }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  if (!(await owned(id))) return NextResponse.json({ error: "You do not have permission to update this review." }, { status: 403 });
  const body = await request.json();
  const name = clean(body.name, 120);
  const text = clean(body.text, 1500);
  const rating = Number(body.rating);
  if (body.consentAccepted !== true) return NextResponse.json({ error: "Please accept the review consent before updating your review.", code: "consent_required" }, { status: 400 });
  if (!name || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please provide valid review details." }, { status: 400 });
  }
  try {
    await query("UPDATE user_reviews SET name=$1,rating=$2,review_text=$3,status='pending',consent_version=$4,consent_at=now(),updated_at=now() WHERE id=$5", [name, rating, text, CONSENT_VERSION, id]);
    const review = await queryOne<{ email: string; identity_provider: string | null; identity_subject: string | null }>("SELECT email, identity_provider, identity_subject FROM user_reviews WHERE id=$1", [id]);
    if (review) {
      const browserProfile = await getPublicProfile();
      await setPublicProfileCookie({ ...browserProfile, name, email: review.email, provider: review.identity_provider === "google" || review.identity_provider === "apple" ? review.identity_provider : browserProfile?.provider ?? "form", providerSubject: review.identity_subject ?? browserProfile?.providerSubject });
    }
  } catch (error) {
    console.error("Public review update failed:", error);
    return NextResponse.json({ error: "Could not update your review right now." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: "Your review was updated and returned to moderation." });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request is not allowed." }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  if (!(await owned(id))) return NextResponse.json({ error: "You do not have permission to delete this review." }, { status: 403 });
  await query("DELETE FROM user_reviews WHERE id=$1", [id]);
  await clearOwnerCookie(id);
  return NextResponse.json({ ok: true, message: "Your review was deleted." });
}
