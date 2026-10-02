import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { createOwnerToken, hashOwnerToken, setOwnerCookie } from "@/lib/userReviews";
import { isSameOriginRequest } from "@/lib/publicRequest";
import { CONSENT_VERSION, getPublicProfile, setPublicProfileCookie } from "@/lib/publicProfile";

function validEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function clean(value: unknown, max: number): string { return String(value ?? "").trim().slice(0, max); }

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "This form submission is not allowed." }, { status: 403 });
    }
    const body = await request.json();
    const workId = Number(body.workId);
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const text = clean(body.text, 1500);
    const rating = Number(body.rating);
    const honeypot = clean(body.website, 120);
    const consentAccepted = body.consentAccepted === true;
    if (honeypot) return NextResponse.json({ ok: true, message: "Thank you. Your review has been submitted and is awaiting moderation." }, { status: 201 });
    if (!consentAccepted) return NextResponse.json({ error: "Please accept the review consent before submitting.", code: "consent_required" }, { status: 400 });
    if (!Number.isInteger(workId) || workId < 1 || !name || !validEmail(email) || !text || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please provide your name, valid email, a 1–5 star rating, and a review of at least 10 characters." }, { status: 400 });
    }
    const work = await queryOne<{ id: number }>("SELECT id FROM work_items WHERE id = $1 AND active = true", [workId]);
    if (!work) return NextResponse.json({ error: "Selected work was not found." }, { status: 404 });

    const browserProfile = await getPublicProfile();
    const identityProvider = browserProfile?.provider === "google" || browserProfile?.provider === "apple" ? browserProfile.provider : null;
    const identitySubject = identityProvider ? browserProfile?.providerSubject ?? null : null;
    const existing = await queryOne<{ id: number; status: string }>(
      `SELECT id, status FROM user_reviews
       WHERE work_id = $1
         AND (lower(email) = lower($2)
              OR ($3::text IS NOT NULL AND identity_provider = $3 AND identity_subject = $4))
       LIMIT 1`,
      [workId, email, identityProvider, identitySubject],
    );
    if (existing) {
      return NextResponse.json({
        error: "You already have a review for this work. You can edit your existing review instead of submitting another one.",
        code: "REVIEW_ALREADY_EXISTS",
        reviewId: Number(existing.id),
        status: existing.status,
      }, { status: 409 });
    }

    const ownerToken = createOwnerToken();
    let inserted: { id: number } | null = null;
    try {
      inserted = await queryOne<{ id: number }>(
        `INSERT INTO user_reviews (work_id, name, email, rating, review_text, owner_token_hash, status, identity_provider, identity_subject, consent_version, consent_at) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,now()) RETURNING id`,
        [workId, name, email, rating, text, hashOwnerToken(ownerToken), identityProvider, identitySubject, CONSENT_VERSION],
      );
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "23505") {
        return NextResponse.json({ error: "You already have a review for this work. You can edit your existing review instead of submitting another one.", code: "REVIEW_ALREADY_EXISTS" }, { status: 409 });
      }
      throw error;
    }
    if (!inserted) throw new Error("Review insert failed");
    await setOwnerCookie(Number(inserted.id), ownerToken);
    await setPublicProfileCookie({ ...browserProfile, name, email, provider: browserProfile?.provider ?? "form", providerSubject: browserProfile?.providerSubject });
    return NextResponse.json({ ok: true, id: Number(inserted.id), message: "Thank you. Your review has been submitted and is awaiting moderation." }, { status: 201 });
  } catch (error) {
    console.error("Public review submission failed:", error);
    return NextResponse.json({ error: "Could not submit your review right now. Please try again." }, { status: 500 });
  }
}
