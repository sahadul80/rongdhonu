import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/apiGuard";
import { query } from "@/lib/db";

type AllowedField = {
  table: string;
  column: string;
};

const FIELDS: Record<string, Record<string, AllowedField>> = {
  services: {
    category: { table: "services", column: "category" },
    categoryBn: { table: "services", column: "category_bn" },
    bestFor: { table: "services", column: "best_for" },
    bestForBn: { table: "services", column: "best_for_bn" },
  },
  work: {
    category: { table: "work_items", column: "category" },
    categoryBn: { table: "work_items", column: "category_bn" },
    clientName: { table: "work_items", column: "client_name" },
    location: { table: "work_items", column: "location" },
  },
  team: {
    role: { table: "team_members", column: "role" },
    roleBn: { table: "team_members", column: "role_bn" },
  },
  reviews: {
    role: { table: "reviews", column: "role" },
    roleBn: { table: "reviews", column: "role_bn" },
  },
  business: {
    tagline: { table: "business_profile", column: "tagline" },
    address: { table: "business_profile", column: "address" },
    addressBn: { table: "business_profile", column: "address_bn" },
    mapQuery: { table: "business_profile", column: "map_query" },
  },
  hero: {
    slot: { table: "hero_images", column: "slot" },
    label: { table: "hero_images", column: "label" },
  },
};

export const GET = withAdmin(async (request: Request) => {
  const url = new URL(request.url);
  const collection = url.searchParams.get("collection")?.trim() ?? "";
  const field = url.searchParams.get("field")?.trim() ?? "";
  const q = url.searchParams.get("q")?.trim() ?? "";

  const definition = FIELDS[collection]?.[field];
  if (!definition) {
    return NextResponse.json({ error: "Unsupported suggestion field." }, { status: 400 });
  }

  const values = await query<{ value: string }>(
    `
      SELECT DISTINCT btrim(${definition.column}) AS value
      FROM ${definition.table}
      WHERE ${definition.column} IS NOT NULL
        AND btrim(${definition.column}) <> ''
        AND ($1 = '' OR ${definition.column} ILIKE $2)
      ORDER BY value ASC
      LIMIT 30
    `,
    [q, `%${q}%`],
  );

  return NextResponse.json({ values: values.map((item) => item.value) });
});
