# Rong Dhonu production release notes

This release separates website-submitted work reviews from admin-authored editorial reviews and completes the enquiry workflow.

## Website reviews

- Visitors can open any selected work, view published ratings/reviews and submit a 1–5 star review.
- A submitted review is stored in `user_reviews` with `pending` moderation status.
- The browser receives an HTTP-only owner cookie containing a random review token; only that browser can edit or delete the matching review.
- Editing returns the review to `pending` moderation.
- Deleting removes the website-submitted review.
- The public site never exposes reviewer email addresses.
- Admins cannot edit or delete website review content. They can only set `visible` or `hidden`.

## Admin notifications

- `/api/admin/notifications` returns pending website-review and new-enquiry counts.
- The admin navigation refreshes those indicators every 30 seconds.
- Dashboard metrics also surface new website reviews and new enquiries.

## Enquiries

- Enquiries are presented as contained cards with search and status filters.
- Email, call and open actions mark a previously-new enquiry as `read`.
- Full details open in a wrapped modal; email/call actions remain available there.
- Archive, restore and mark-new actions provide explicit loading/status feedback.

## Public endpoint protection

- Contact and review POST/PUT/DELETE routes enforce same-origin browser requests when an Origin header is supplied.
- Contact and review forms include a hidden honeypot to reduce basic automated spam.

## Database migration

Run `npm run db:migrate`. The migration runner applies `db/schema.sql`, then verifies every SQL migration in filename order. Migrations are idempotent and are deliberately re-checked so a stale `schema_migrations` row cannot mask a missing table/column.

If the deployed app reports `relation \"user_reviews\" does not exist`, run `db/repair-user-reviews.sql` in the Neon SQL Editor and then run `npm run db:migrate`. This is the direct hotfix for databases that were created before the public review feature was added.

For the existing production database, the relevant new migration is `db/migrations/20261002_user_reviews.sql`. It is idempotent and creates/backfills the owner-token column without dropping content.

## Verification performed in this environment

- TypeScript/TSX syntactic parse completed for all 130 source files.
- No browser `alert()`, `confirm()` or `prompt()` calls remain in `app`, `lib` or `scripts`.
- Mobile form-control CSS uses a 16px minimum on small screens to prevent iOS Safari focus zoom.
- A full `npm ci` / production build could not be completed in this sandbox because the npm registry was not reachable and the required dependency tarballs were not cached. The release therefore still needs a normal CI/Vercel `npm ci && npm run build` before deployment.

### Public work review uniqueness

Website reviews are limited to one active review per work per reviewer email address. PostgreSQL enforces this with `ux_user_reviews_work_email`; users edit their existing review instead of creating another. Deleting a review removes the active record and permits a new submission later.
