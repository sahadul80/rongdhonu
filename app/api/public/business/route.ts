import { NextResponse } from "next/server";
import { getBusinessProfile } from "@/lib/content";

export async function GET() {
  try {
    const business = await getBusinessProfile();
    return NextResponse.json(
      { business },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public business:", error);
    return NextResponse.json({ error: "Business profile temporarily unavailable." }, { status: 503 });
  }
}
