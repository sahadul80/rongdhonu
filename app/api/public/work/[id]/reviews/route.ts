import { NextResponse } from "next/server";
import { getReviewsForWork } from "@/lib/content";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const workId = Number(id);
  if (!Number.isInteger(workId) || workId <= 0) return NextResponse.json({ error: "Invalid work id." }, { status: 400 });

  try {
    const reviews = await getReviewsForWork(workId);
    return NextResponse.json({ reviews }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to load related work reviews:", error);
    return NextResponse.json({ error: "Related reviews temporarily unavailable." }, { status: 503 });
  }
}
