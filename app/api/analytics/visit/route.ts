import { NextResponse } from "next/server";
import { recordVisitor } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });
    await recordVisitor(body, request);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Visitor analytics write failed:", error);
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
