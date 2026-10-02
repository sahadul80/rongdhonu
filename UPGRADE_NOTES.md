# Rong Dhonu CMS upgrade notes

This archive was rebuilt FROM the supplied `rongdhonu-baseline-v1-1.zip` so the complete baseline source tree is preserved.

## Unbounded CMS collections

- `/services/[slug]`
- `/reviews/[slug]`
- `/{business.workSlug}/[slug]`
- `/{business.teamSlug}/[slug]`

Collection indexes remain available at `/services`, `/reviews`, `/{business.workSlug}` and `/{business.teamSlug}`.

## Dashboard and CMS management

The admin dashboard is now organized as a compact workspace:

- compact KPI strip
- three frequency charts
- unified Website Content table for Services, Our Work, Our Team and Reviews
- search by title, slug, category or role
- type and visibility filters
- sortable Content / Section / Status / Updated columns with ASC/DESC indicators
- direct Edit links to the appropriate CMS editor
- public detail links for visible slug records
- sortable, searchable and filterable visitor analytics table

Every unbounded CMS record has editable slug manipulation in the admin editor. New Services, Work, Team and Review records generate a slug automatically when the slug field is left empty, while existing slugs remain explicitly editable so public URLs can be managed deliberately.

## Analytics

First-party visitor analytics were added with:

- `site_visitors`
- `site_visit_events`
- `/api/analytics/visit`
- `/api/admin/analytics/visitors`
- dashboard visitor/review/enquiry charts
- sortable/searchable/filterable visitor table

Only a hashed IP and masked IP are retained; raw IP addresses are not stored.

## Important baseline note

The supplied baseline already contained an empty `lib/createClient.ts` (0 bytes) and it was unused by the codebase. It was intentionally left unchanged rather than inventing implementation that was not present in the supplied production baseline.

## Production database migration

Before deploying the analytics dashboard, run:

`db/migrations/20261002_production_upgrade.sql`

against the production Neon database. This migration is idempotent and upgrades the public slug fields for Services, Our Work, Our Team and Reviews, adds review rating/timestamp fields, first-party visitor analytics tables, and required indexes without deleting existing content.

## CMS media and field suggestions (2026-10-02)

- Replaced the large CMS `ImageUploadInput` preview with a compact horizontal media control: 80x64 preview, compact status, choose/replace/remove actions, and inline validation.
- Added `app/admin/(dashboard)/SuggestionInput.tsx` for database-backed field suggestions.
- Added `GET /api/admin/suggestions?collection=<...>&field=<...>&q=<...>` with a strict allowlist to prevent arbitrary SQL identifiers.
- Added suggestions for repeated CMS fields: service categories/best-for, work categories/client/location, team roles, review roles, business tagline/address/map query, and hero slots/labels.
- Existing values remain freeform; suggestions are helpers, not hard selects, so admins can create new values.

## CMS action feedback upgrade — 2 October 2026

All server-side CMS mutations now use a shared `AdminActionButton` and `AdminActionFeedback` pattern.

Covered actions:
- business profile save
- service create/save/delete
- work create/save/delete
- team create/save/delete
- review create/save/delete
- hero/process image save and refresh
- enquiry status updates and refresh
- dashboard/visitor analytics refresh
- login/logout loading states

Mutation buttons disable while their own action is in progress, replace their icon with a spinner, and expose a clear action-specific label such as `Saving…`, `Adding…`, `Deleting…`, `Removing…`, or `Refreshing…`. Successful and failed actions use an accessible status/alert feedback region.

The visitor analytics Refresh button now actually invalidates and refetches the current dataset instead of only updating the same offset value.
