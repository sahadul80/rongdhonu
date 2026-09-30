import "server-only";

export const NEON_DATA_API_URL = process.env.NEON_DATA_API_URL || "https://ep-restless-block-b49qbj4m.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1";
export const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL || "https://ep-restless-block-b49qbj4m.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth";
export const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL || "https://ep-restless-block-b49qbj4m.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json";
export const NEON_APPLICATION_NAME = process.env.NEON_APPLICATION_NAME || "Rong Dhonu";

export function getNeonConfig() {
  return {
    dataApiUrl: NEON_DATA_API_URL.replace(/\/$/, ""),
    authBaseUrl: NEON_AUTH_BASE_URL.replace(/\/$/, ""),
    jwksUrl: NEON_AUTH_JWKS_URL.replace(/\/$/, ""),
    applicationName: NEON_APPLICATION_NAME,
    hasDataApiToken: Boolean(process.env.NEON_DATA_API_TOKEN),
  };
}
