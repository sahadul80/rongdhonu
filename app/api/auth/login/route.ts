import { NextResponse } from "next/server";
import { verifyAdminLogin, createAdminSession } from "@/lib/auth";
import { validateLoginForm } from "@/lib/formValidation";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const validation = validateLoginForm(email, password);
  if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

  const user = await verifyAdminLogin(email, password);
  if (!user) {
    // Same message either way — never reveal whether the email exists.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createAdminSession(user);
  return NextResponse.json({ ok: true, email: user.email });
}
