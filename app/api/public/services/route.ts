import { NextResponse } from "next/server";
import { getActiveServices } from "@/lib/content";

const cacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    const services = await getActiveServices();
    return NextResponse.json({ services }, { headers: cacheHeaders });
  } catch (error) {
    console.error("Failed to load public services:", error);
    return NextResponse.json({ error: "Services temporarily unavailable." }, { status: 503 });
  }
}
