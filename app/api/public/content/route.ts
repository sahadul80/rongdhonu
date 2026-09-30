import { NextResponse } from "next/server";
import {
  getActiveReviews,
  getActiveServices,
  getActiveTeam,
  getActiveWork,
  getBusinessProfile,
  getHeroImages,
} from "@/lib/content";

export async function GET() {
  try {
    const [business, services, reviews, heroImages, team, work] = await Promise.all([
      getBusinessProfile(),
      getActiveServices(),
      getActiveReviews(),
      getHeroImages(),
      getActiveTeam(),
      getActiveWork(),
    ]);

    return NextResponse.json(
      { business, services, reviews, team, work, heroImages },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public content:", error);
    return NextResponse.json({ error: "Content temporarily unavailable." }, { status: 503 });
  }
}
