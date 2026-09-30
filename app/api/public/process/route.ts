import { NextResponse } from "next/server";
import { getHeroImages } from "@/lib/content";

export async function GET() {
  try {
    const process = (await getHeroImages()).filter((item) => item.slot !== "banner" && item.imageUrl);
    return NextResponse.json(
      { process },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public process:", error);
    return NextResponse.json({ error: "Process data temporarily unavailable." }, { status: 503 });
  }
}
