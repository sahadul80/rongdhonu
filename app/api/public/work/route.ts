import { NextResponse } from "next/server";
import { getActiveWork } from "@/lib/content";

export async function GET() {
  try {
    const work = await getActiveWork();
    return NextResponse.json({ work }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to load public work:", error);
    return NextResponse.json({ error: "Work temporarily unavailable." }, { status: 503 });
  }
}
