// Applies the base schema and all idempotent migrations in db/migrations.
// Usage: node --env-file=.env scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs";
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
    max: 4,
    connectionTimeoutMillis: 20000,
  });
  try {
    await pool.query(readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8"));
    const migrationDir = path.join(__dirname, "..", "db", "migrations");
    const migrations = readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort();
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    for (const name of migrations) {
      // Migrations in this project are intentionally idempotent. Re-run them on
      // every deployment so a stale schema_migrations record can never leave a
      // required relation/column missing after a restored or partially migrated DB.
      const sql = readFileSync(path.join(migrationDir, name), "utf8");
      await pool.query(sql);
      await pool.query(
        `INSERT INTO schema_migrations(name) VALUES($1)
         ON CONFLICT (name) DO UPDATE SET applied_at = now()`,
        [name],
      );
      console.log(`Verified migration: ${name}`);
    }
    console.log("Schema and migrations are up to date.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => { console.error("Migration failed:", error); process.exit(1); });
