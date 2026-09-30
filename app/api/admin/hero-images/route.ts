import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";
import { isValidImageDataUri, parseSortOrder, validateSortOrder } from "@/lib/formValidation";

export const GET = withAdmin(async () => {
  const rows = await query("SELECT * FROM hero_images ORDER BY sort_order ASC");
  return NextResponse.json({ heroImages: rows });
});

export const PUT = withAdmin(async (request: Request) => {
  const body = await request.json();
  const slot = String(body.slot ?? "").trim().slice(0, 60);
  const label = String(body.label ?? "").trim().slice(0, 160);
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const sortCheck = validateSortOrder(body.sortOrder);
  if (!slot || !label) return NextResponse.json({ error: "slot and label are required." }, { status: 400 });
  if (!sortCheck.ok) return NextResponse.json({ error: sortCheck.message }, { status: 400 });
  if (!isValidImageDataUri(imageUrl)) return NextResponse.json({ error: "Image must be a PNG, JPG or WebP base64 data URI." }, { status: 400 });

  await query(
    `INSERT INTO hero_images (slot, label, image_url, sort_order, updated_at) VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (slot) DO UPDATE SET label = $2, image_url = $3, sort_order = $4, updated_at = now()`,
    [slot, label, imageUrl, parseSortOrder(body.sortOrder)],
  );
  return NextResponse.json({ ok: true });
});
