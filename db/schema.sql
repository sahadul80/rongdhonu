-- ─────────────────────────────────────────────────────────────────────────────
-- Rong Dhonu CMS schema  (PostgreSQL / Neon)
--
-- HOW TO USE
--   Neon Console → your project → SQL Editor → paste this whole file → Run.
--
-- Safe to run more than once:
--   • a fresh database gets every table,
--   • an existing database (created from an older version of this file) is upgraded
--     in place with the new Bangla columns — no data is lost.
--
-- This file contains NO sample content. The public site uses safe empty-state
-- fallbacks until you add your own content from /admin.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Admin logins ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Business identity (singleton row: id is always 1) ────────────────────────
CREATE TABLE IF NOT EXISTS business_profile (
  id                INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name              TEXT NOT NULL,
  short_name        TEXT NOT NULL,
  tagline           TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT NOT NULL,
  website           TEXT NOT NULL,
  address           TEXT NOT NULL,
  address_bn        TEXT,
  map_query         TEXT NOT NULL,
  logo_url          TEXT,
  logo_reversed_url TEXT,
  icon_url          TEXT,
  team_slug         TEXT NOT NULL DEFAULT 'our-team',
  work_slug         TEXT NOT NULL DEFAULT 'our-work',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Services ─────────────────────────────────────────────────────────────────
-- *_bn columns are optional; the site falls back to the English text when empty.
CREATE TABLE IF NOT EXISTS services (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_bn        TEXT,
  category       TEXT NOT NULL,
  category_bn    TEXT,
  description    TEXT NOT NULL,
  description_bn TEXT,
  best_for       TEXT NOT NULL,
  best_for_bn    TEXT,
  accent         TEXT NOT NULL DEFAULT 'red',
  image_url      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  active         BOOLEAN NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Our team
CREATE TABLE IF NOT EXISTS team_members (
  id         SERIAL PRIMARY KEY,
  slug       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  name_bn    TEXT,
  role       TEXT NOT NULL,
  role_bn    TEXT,
  bio        TEXT,
  bio_bn     TEXT,
  photo_url  TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Our work / portfolio
CREATE TABLE IF NOT EXISTS work_items (
  id             SERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  title_bn       TEXT,
  category       TEXT NOT NULL,
  category_bn    TEXT,
  description    TEXT NOT NULL,
  description_bn TEXT,
  client_name    TEXT,
  location      TEXT,
  year          INTEGER,
  image_url      TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT true,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Client reviews ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT,
  role_bn    TEXT,
  text_en    TEXT NOT NULL,
  text_bn    TEXT,
  work_id    INTEGER REFERENCES work_items(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Banner + process-step pictures, keyed by a fixed slot name ───────────────
CREATE TABLE IF NOT EXISTS hero_images (
  slot       TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  image_url  TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Contact form enquiries ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  service_interest TEXT,
  message          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Upgrade path for databases created before the Bangla columns existed ─────
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS address_bn     TEXT;
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS team_slug      TEXT NOT NULL DEFAULT 'our-team';
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS work_slug      TEXT NOT NULL DEFAULT 'our-work';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE services         ADD COLUMN IF NOT EXISTS name_bn        TEXT;
ALTER TABLE services         ADD COLUMN IF NOT EXISTS category_bn    TEXT;
ALTER TABLE services         ADD COLUMN IF NOT EXISTS description_bn TEXT;
ALTER TABLE services         ADD COLUMN IF NOT EXISTS best_for_bn    TEXT;
ALTER TABLE reviews          ADD COLUMN IF NOT EXISTS role_bn        TEXT;
ALTER TABLE team_members     ADD COLUMN IF NOT EXISTS name_bn        TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS bio_bn TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS work_id INTEGER REFERENCES work_items(id) ON DELETE SET NULL;

-- Backfill stable team slugs for existing rows before enforcing uniqueness.
UPDATE team_members
SET slug = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL OR trim(slug) = '';
UPDATE team_members t
SET slug = regexp_replace(trim(t.slug), '-+', '-', 'g') || '-' || t.id
WHERE EXISTS (SELECT 1 FROM team_members x WHERE x.slug = t.slug AND x.id <> t.id);
UPDATE team_members SET slug = 'team-' || id WHERE slug IS NULL OR trim(slug) = '';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_members_slug_key') THEN
    ALTER TABLE team_members ADD CONSTRAINT team_members_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_sort              ON services (sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_sort               ON reviews (sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_sort          ON team_members (sort_order);
CREATE INDEX IF NOT EXISTS idx_work_items_sort            ON work_items (sort_order);
CREATE INDEX IF NOT EXISTS idx_work_items_active          ON work_items (active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_work              ON reviews (work_id, sort_order);

-- ── Picture slots (structure only — no images). Needed so the admin's
--    "Hero & Process Pictures" page has something to edit. ────────────────────
INSERT INTO hero_images (slot, label, sort_order) VALUES
  ('banner',    'Main banner',                    0),
  ('process-1', 'Process — Consultation',         1),
  ('process-2', 'Process — Color & Finish Plan',  2),
  ('process-3', 'Process — Surface Preparation',  3),
  ('process-4', 'Process — Execution',            4),
  ('process-5', 'Process — Final Review',         5)
ON CONFLICT (slot) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════════════════
-- CREATE YOUR ADMIN LOGIN  (run this block separately, once)
--   1. Change the email and password below.
--   2. Run it in the Neon SQL Editor.
--   3. Sign in at  https://your-site/admin/login
-- The password is hashed with bcrypt inside the database, so it is never stored
-- in plain text. Delete the password from your clipboard/history afterwards.
-- ═════════════════════════════════════════════════════════════════════════════
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- INSERT INTO admin_users (email, password_hash)
-- VALUES ('you@example.com', crypt('CHANGE-ME-to-a-strong-password', gen_salt('bf', 12)))
-- ON CONFLICT (email) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════════════════
