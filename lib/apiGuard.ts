import { NextResponse } from "next/server";
import { requireAdminSession } from "./auth";

/** Wraps an admin API route handler: returns 401 automatically if there is no valid
 *  admin session, so every /api/admin/* route doesn't have to repeat the try/catch. */
export function withAdmin<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      await requireAdminSession();
    } catch {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    return handler(...args);
  };
}
