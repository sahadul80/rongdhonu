import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getDashboardSummary();
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Dashboard summary unavailable:", error);
    return NextResponse.json({ error: "Dashboard data temporarily unavailable." }, { status: 503 });
  }
}
