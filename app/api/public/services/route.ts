import { NextResponse } from "next/server";
import { getActiveServices } from "@/lib/content";

export async function GET() {
  try {
    const services = await getActiveServices();
    return NextResponse.json({ services }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to load public services:", error);
    return NextResponse.json({ error: "Services temporarily unavailable." }, { status: 503 });
  }
}
