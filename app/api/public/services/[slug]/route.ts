import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/lib/content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  try {
    const service = await getServiceBySlug(slug);
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json(
      { service },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public service:", error);
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }
}
