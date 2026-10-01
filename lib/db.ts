import "server-only";
import { Pool } from "pg";

/**
 * Single shared PostgreSQL connection pool for the whole app.
 *
 * DATABASE_URL should explicitly define the desired SSL mode.
 * For the current pg behavior, use:
 *
 *   ?sslmode=verify-full
 *
 * This allows PostgreSQL/pg to perform full certificate and hostname
 * verification instead of relying on `rejectUnauthorized: false`.
 *
 * The pool is created lazily on first query, so the app can boot
 * before DATABASE_URL has been configured.
 */
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill in your Postgres credentials."
    );
  }

  return new Pool({
    connectionString,
    max: 10,
    // Neon computes auto-suspend; a cold start plus TLS can take well over 3.5s.
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
  });
}

// Reused across hot-reloads in development and across invocations
// instead of opening a fresh pool on every import.
export function getPool(): Pool {
  return global.__pgPool ?? (global.__pgPool = createPool());
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}