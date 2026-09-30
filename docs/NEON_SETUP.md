# Neon Data API + Neon Auth configuration

The application is prepared to use the Rong Dhonu Neon branch through the Neon Data API for public reads, while protected admin writes continue to use `DATABASE_URL` on the server.

## Environment variables

Copy `.env.example` to `.env` and configure: 

```bash
NEON_APPLICATION_NAME=Rong Dhonu
NEON_USE_DATA_API=true
NEON_DATA_API_URL=https://ep-restless-block-b49qbj4m.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1
NEON_AUTH_BASE_URL=https://ep-restless-block-b49qbj4m.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth
NEON_AUTH_JWKS_URL=https://ep-restless-block-b49qbj4m.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json
```

Do not put a database password, JWT, or Data API credential in a `NEXT_PUBLIC_*` variable or commit it to Git. `NEON_DATA_API_TOKEN` is intentionally blank until the Neon Data API/Auth configuration provides the appropriate server-side credential.

## Neon console steps

1. Enable the Data API for the production branch that backs Rong Dhonu.
2. Run `db/schema.sql` if the schema has not yet been created.
3. Run `db/neon-data-api.sql` to enable RLS and permit only the intended public reads for the Data API roles.
4. Refresh the Data API schema cache after changing tables or policies.
5. In Neon Auth, set the application name to **Rong Dhonu** and add the exact production/staging domains that are allowed to receive authentication redirects.
6. Keep the existing server-side admin session until the application is deliberately migrated to Neon Auth; the Neon Auth URLs are configured here so that migration does not require another architecture change.

## Google Maps

For a deterministic Google Maps place pin and the road-map embed, set: 

```bash
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=...
```

Restrict that key by website origin/API before deploying. The contact map uses the business `map_query`; for the exact place pin, set that field in the admin Business settings to the canonical Google Maps place/search text (or later add a verified Google Place ID).

The site also provides Google Maps Search and Directions links from the map modal.
