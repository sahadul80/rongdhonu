import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  serviceInterest?: string;
  message?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Best-effort email notification to the business — a failure here never blocks the
 *  submission itself, since the database row is the source of truth. Only attempted
 *  if SMTP_HOST is configured at all. */
async function notifyByEmail(submission: { name: string; email: string; phone: string; serviceInterest: string; message: string }) {
  const host = process.env.SMTP_HOST;
  if (!host) return;
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER,
      replyTo: submission.email,
      subject: `New enquiry from ${submission.name}`,
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `Phone: ${submission.phone || "—"}`,
        `Service interest: ${submission.serviceInterest || "—"}`,
        "",
        submission.message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Contact notification email failed (submission was still saved):", error);
  }
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 160);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const serviceInterest = String(body.serviceInterest ?? "").trim().slice(0, 160);
  const message = String(body.message ?? "").trim().slice(0, 4000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required.", code: "required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address.", code: "invalid_email" }, { status: 400 });
  }

  await query(
    `INSERT INTO contact_submissions (name, email, phone, service_interest, message) VALUES ($1, $2, $3, $4, $5)`,
    [name, email, phone || null, serviceInterest || null, message]
  );

  await notifyByEmail({ name, email, phone, serviceInterest, message });

  return NextResponse.json({ ok: true });
}
