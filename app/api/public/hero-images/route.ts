import { NextResponse } from "next/server";
import { getHeroImages } from "@/lib/content";

export async function GET() {
  try {
    const heroImages = await getHeroImages();
    return NextResponse.json(
      { heroImages },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public hero images:", error);
    return NextResponse.json({ error: "Hero images temporarily unavailable." }, { status: 503 });
  }
}
