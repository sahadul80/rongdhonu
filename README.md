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
5. `npm install && npm run dev`, then sign in at `http://localhost:3000/admin/login`.

### Neon Data API + Auth configuration
See [`docs/NEON_SETUP.md`](docs/NEON_SETUP.md) for the Rong Dhonu Data API URL, application name, RLS policy setup, schema-cache refresh, trusted authentication domains and Google Maps configuration.

### Option B — command line
```bash
cp .env.example .env        # set DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate          # applies db/schema.sql
npm run db:seed             # creates the first admin login only
npm run dev
```

### What's editable from the dashboard
- **Dashboard home** — live counts plus a preview of your team and latest reviews
- **Business Info** — name, tagline, phone, email, website, address (English + optional Bangla), logo
- **Services** — add, edit, reorder (via sort order), hide, or delete (English + optional Bangla)
- **Our Team** — name, dynamic profile slug, role, short bio, photo (English + optional Bangla); homepage cards link to dynamic team URLs
- **Hero & Process Pictures** — the main banner and the rotating process-step images
- **Reviews** — client testimonials (English + optional Bangla text and role), optionally linked to an Our Work item
- **Our Work** — portfolio entries with dynamic slugs, images and project metadata; individual work pages show related reviews
- **Enquiries** — every contact form submission, with a read/archived status

### Notes
- Images are uploaded through the dashboard and stored directly in Postgres as base64 (logos/pictures capped at 3MB each). Team photos are shrunk automatically in the browser (max 480px) so they stay small.
- The Team and Reviews sections have no built-in placeholder people — each stays hidden until you add real entries.
- **Bangla / English:** every piece of built-in website text is translated. For content you add in the dashboard, fill in the optional Bangla fields; when a Bangla field is left empty the English text is shown instead.
- Email notifications for new enquiries are optional — leave `SMTP_HOST` unset in `.env` to skip them; submissions are always saved to the database regardless.
- If the database is ever unreachable, the public site falls back to its last-shipped static content instead of showing a blank page.
- In production, `SESSION_SECRET` is required — the app will not sign admin sessions without it.
