import { NextResponse } from "next/server";
import { getActiveReviews } from "@/lib/content";

export async function GET() {
  try {
    const reviews = await getActiveReviews();
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=120" } });
  } catch (error) {
    console.error("Failed to load public reviews:", error);
    return NextResponse.json({ error: "Reviews temporarily unavailable." }, { status: 503 });
  }
}
