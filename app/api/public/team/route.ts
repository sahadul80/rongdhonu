import { NextResponse } from "next/server";
import { getActiveTeam } from "@/lib/content";

export async function GET() {
  try {
    const team = await getActiveTeam();
    return NextResponse.json({ team }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to load public team:", error);
    return NextResponse.json({ error: "Team temporarily unavailable." }, { status: 503 });
  }
}
