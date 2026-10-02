import { NextResponse } from "next/server";
import { getTeamBySlug } from "@/lib/content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  try {
    const member = await getTeamBySlug(slug);
    if (!member) return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    return NextResponse.json(
      { member },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load public team member:", error);
    return NextResponse.json({ error: "Team member temporarily unavailable." }, { status: 503 });
  }
}
