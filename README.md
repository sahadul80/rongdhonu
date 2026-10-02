# Rong Dhonu Renovation Limited

Business website focused on the supplied service offering:

- General Painting Work
- Various Wall Paint & Color Schemes
- Skim Coat Work
- Marble Painting
- Ambrose Painting
- Texture Work

## Structure

- `app/components/ServicesSection.tsx` — service catalogue and filters
- `app/components/ProcessSection.tsx` — proposed service workflow
- `app/components/Hero.tsx` — business positioning and primary CTA
- `app/components/AboutSection.tsx` — company positioning
- `app/components/ContactSection.tsx` — business contact information
- `app/data/services.ts` — editable service data
- `app/data/brand.ts` — editable business metadata
- `public/images/rong-dhonu/` — supplied brand images

The service names above are based directly on the business offering supplied for this update. The grouping, descriptions, process and website positioning are proposed presentation structure and should be reviewed by the business before publishing.

## CMS & database setup

Business info, services, team, hero/process pictures and reviews are editable through a login-protected dashboard at `/admin`, backed by Postgres. Contact form submissions are saved to the database too (and optionally emailed). No sample content ships with the project.

### Option A — Neon SQL Editor (no terminal needed)
1. Create a free project at https://neon.tech and copy the **pooled** connection string.
2. Neon Console → **SQL Editor** → paste `db/schema.sql` → **Run**.
3. Run `db/neon-content.sql` to insert the source-backed business, service and image content. (Safe to re-run; it also upgrades older databases with the new Bangla columns.)
4. In the same editor, un-comment and edit the **CREATE YOUR ADMIN LOGIN** block at the bottom of the file, then run it.
5. Set the environment variables (`.env` locally, or Project → Settings → Environment Variables on Vercel):
   ```bash
   cp .env.example .env
   # set DATABASE_URL and SESSION_SECRET at minimum
   ```
6. `npm install && npm run dev`, then sign in at `http://localhost:3000/admin/login`.

### Neon Data API + Auth configuration
See [`docs/NEON_SETUP.md`](docs/NEON_SETUP.md) for the Rong Dhonu Data API URL, application name, RLS policy setup, schema-cache refresh, trusted authentication domains and Google Maps configuration.

### Option B — command line
```bash
cp .env.example .env        # set DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate          # applies db/schema.sql + every db/migrations/*.sql in order
npm run db:seed             # creates the first admin login only
npm run dev
```

### What's editable from the dashboard
- **Dashboard home** — compact analytics, frequency charts, unified CMS content search/sort/filter, visitor analytics and quick management links
- **Business Info** — name, tagline, phone, email, website, address (English + optional Bangla), logo
- **Services** — add, edit dynamic slug, reorder, hide, search/filter from the management workflow, or delete (English + optional Bangla)
- **Our Team** — name, dynamic profile slug, role, short bio, photo (English + optional Bangla); homepage cards link to dynamic team URLs
- **Hero & Process Pictures** — the main banner and the rotating process-step images
- **Reviews** — client testimonials with editable dynamic slugs, ratings, English/Bangla text and role, optionally linked to an Our Work item
- **Our Work** — portfolio entries with editable dynamic slugs, images and project metadata; individual work pages show related reviews
- **Enquiries** — every contact form submission, with a read/archived status

### Notes
- Images are uploaded through the dashboard and stored directly in Postgres as base64 (logos/pictures capped at 3MB each). Team photos are shrunk automatically in the browser (max 480px) so they stay small.
- The Team and Reviews sections have no built-in placeholder people — each stays hidden until you add real entries.
- **Bangla / English:** every piece of built-in website text is translated. For content you add in the dashboard, fill in the optional Bangla fields; when a Bangla field is left empty the English text is shown instead.
- Email notifications for new enquiries are optional — leave `SMTP_HOST` unset in `.env` to skip them; submissions are always saved to the database regardless.
- If the database is ever unreachable, the public site falls back to its last-shipped static content instead of showing a blank page.
- In production, `SESSION_SECRET` is required — the app will not sign admin sessions without it.


## Production CMS migration

For an existing production Neon database, run `db/migrations/20261002_production_upgrade.sql` before deploying the upgraded dashboard. It adds/backfills the slug fields required by the dynamic public pages and creates the first-party analytics tables. It does not drop existing CMS data.

The dashboard expects `site_visitors` and `site_visit_events` to exist. If the production database has not received this migration, `/api/admin/dashboard` will return a database relation error.


## Production deployment checklist

1. Use a pooled Neon/Postgres connection with TLS verification enabled (`sslmode=verify-full`).
2. Set a unique, high-entropy `SESSION_SECRET`; never use the development fallback in production.
3. Apply `npm run db:migrate` against the production database before the first deployment of a schema-changing release.
4. Keep `NEON_DATA_API_TOKEN`, SMTP credentials and database credentials server-only; never expose them through `NEXT_PUBLIC_*`.
5. Build with `npm run build` and deploy only after the build succeeds in the CI/Vercel environment with production environment variables configured.
6. Confirm `/admin/login`, `/admin/reviews`, `/admin/submissions` and the public selected-work review flow after deployment.
7. Website reviews are stored separately from admin-authored reviews. Admins may only change their visibility (`visible`/`hidden`); website users can update or delete only reviews owned by their browser cookie.
8. Public contact and review POST endpoints enforce same-origin requests and include a hidden honeypot to reduce basic automated spam.
9. On iOS Safari, form controls use a minimum 16px font size on mobile so focusing an input does not trigger automatic page zoom.
10. Public enquiries and user reviews require explicit consent; the consent version and timestamp are stored with the submission.
11. Successful public-form submissions save a 180-day HttpOnly browser profile cookie containing only name, email and phone for future form autofill. Users can clear it from the consent panel.
12. Google and Apple identity buttons are enabled only after their server credentials are configured. See `docs/PUBLIC_FORM_IDENTITY.md`.
13. For review identity enforcement, email is the fallback identity and verified Google/Apple provider subjects are also stored and uniquely constrained per selected work.

## CMS UI update — 2026-10-02

The CMS workspace now uses a shared compact header/toolbar pattern across the dashboard and content editors.

- Sticky page headers keep primary actions visible while records scroll.
- List editors expose search and contextual filters in the header toolbar.
- Review source tabs, enquiry filters, image-slot filters and analytics range remain visible while scrolling.
- Action feedback is kept in a sticky status rail so success/error results remain visible after a mutation.
- Mobile CMS controls use compact 36px fields/buttons, reduced page padding, stacked toolbars, horizontally scrollable tabs, and single-column team fields.
- Record-level edit/delete/save actions remain attached to their record so an action cannot be applied to the wrong item.
