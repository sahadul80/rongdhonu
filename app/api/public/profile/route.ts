import { NextResponse } from "next/server";
import { clearPublicProfileCookie, getPublicProfile } from "@/lib/publicProfile";
import { isSameOriginRequest } from "@/lib/publicRequest";

export async function GET() {
  const profile = await getPublicProfile();
  const publicProfile = profile ? { name: profile.name, email: profile.email, phone: profile.phone, provider: profile.provider } : null;
  return NextResponse.json({ profile: publicProfile }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "This request is not allowed." }, { status: 403 });
  await clearPublicProfileCookie();
  return NextResponse.json({ ok: true });
}
