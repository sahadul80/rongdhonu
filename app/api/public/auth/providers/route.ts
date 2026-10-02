import { NextResponse } from "next/server";
import { appleConfigured, googleConfigured } from "@/lib/publicOAuth";

export async function GET() {
  return NextResponse.json({ google: googleConfigured(), apple: appleConfigured() }, { headers: { "Cache-Control": "public, max-age=60" } });
}
