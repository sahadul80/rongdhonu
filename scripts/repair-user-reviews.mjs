// One-shot production repair for databases where user_reviews is missing/incomplete.
// Usage: node --env-file=.env scripts/repair-user-reviews.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and fill in your Postgres credentials first.");
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: process.env.PGSSL === "false" ? false : undefined,
    max: 2,
    connectionTimeoutMillis: 20000,
  });

  try {
    const sql = readFileSync(path.join(__dirname, "..", "db", "repair-user-reviews.sql"), "utf8");
    await pool.query(sql);
    console.log("user_reviews is present and ready for production traffic.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("User review database repair failed:", error);
  process.exit(1);
});
