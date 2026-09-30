// Creates the first admin login. No sample content is inserted — add real content from /admin.
// Safe to re-run: it never overwrites an existing admin's password.
// Usage: node --env-file=.env scripts/seed.mjs
// (Alternative: run the "CREATE YOUR ADMIN LOGIN" block at the bottom of db/schema.sql
//  in the Neon SQL Editor instead.)
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and fill in your Postgres credentials first.");
    process.exit(1);
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env — nothing to do.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString, ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false } });
  try {
    const existing = await pool.query("SELECT id FROM admin_users WHERE email = $1", [adminEmail.toLowerCase()]);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await pool.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)", [adminEmail.toLowerCase(), hash]);
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      console.log(`Admin user ${adminEmail} already exists — left unchanged.`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
