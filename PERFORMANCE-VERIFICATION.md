# Rong Dhonu performance verification — 30 Sep 2026

## Implemented

- Landing sections use `React.lazy()` so their module imports begin only after each viewport gate opens.
- Landing viewport gates use 100–160px prefetch distance instead of the previous 500–700px ranges.
- Off-screen section wrappers use `content-visibility: auto` with intrinsic size containment.
- Primary hero data uses cached direct PostgreSQL reads on the critical server render, avoiding a Data API HTTP round-trip and fallback on first paint.
- Primary hero database reads are cached for 60 seconds with `unstable_cache`.
- Secondary hero data waits for browser idle time and only the currently displayed hero image is mounted, so all hero images are not downloaded together.
- Floating chat support is moved out of the critical bundle and loaded during browser idle time.
- Public Data API reads have a 3.5s abort timeout; section fetches have a 7s client abort timeout.
- PostgreSQL pool uses bounded connection count and 3.5s connection timeout.
- Root Apple touch icons are present:
  - `/apple-touch-icon.png`
  - `/apple-touch-icon-precomposed.png`

## Static verification

- TypeScript/TSX files scanned: 99
- TypeScript/TSX transpile parser errors: 0
- `package.json` JSON parse: OK
- `package-lock.json` JSON parse: OK
- `/api/public/content` frontend references: 0
- Section `rootMargin` values: 100–160px on landing section gates
- `next/dynamic` in landing section loader: removed
- `React.lazy` section imports: 10
- Deferred floating support import: 1

## Production-build limitation

A full `next build` was not executable in this environment because the supplied project does not include `node_modules`, and dependency installation timed out. The source was therefore validated with the installed TypeScript parser instead of claiming a production build that was not run.
