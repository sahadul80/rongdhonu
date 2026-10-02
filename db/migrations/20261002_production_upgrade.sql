BEGIN;

-- Rong Dhonu production upgrade migration
-- Safe to run against the current production Neon database.
-- It upgrades the older production schema to the CMS + analytics schema
-- without dropping or replacing existing content.

-- ─────────────────────────────────────────────────────────────────────────────
-- Public detail-page fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE work_items
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS work_id INTEGER REFERENCES work_items(id) ON DELETE SET NULL;

-- Backfill stable service slugs from the existing service IDs.
UPDATE services
SET slug = id
WHERE slug IS NULL OR trim(slug) = '';

UPDATE services
SET slug = 'service-' || id
WHERE slug IS NULL OR trim(slug) = '';

UPDATE team_members
SET slug = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g') || '-' || id
WHERE slug IS NULL OR trim(slug) = '';

UPDATE team_members
SET slug = regexp_replace(slug, '-+', '-', 'g')
WHERE slug IS NOT NULL;

UPDATE team_members
SET slug = regexp_replace(slug, '(^-|-$)', '', 'g')
WHERE slug IS NOT NULL;

UPDATE work_items
SET slug = regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g') || '-' || id
WHERE slug IS NULL OR trim(slug) = '';

UPDATE work_items
SET slug = regexp_replace(slug, '-+', '-', 'g')
WHERE slug IS NOT NULL;

UPDATE work_items
SET slug = regexp_replace(slug, '(^-|-$)', '', 'g')
WHERE slug IS NOT NULL;

-- Backfill stable review slugs using the reviewer's name + ID.
UPDATE reviews
SET slug = regexp_replace(
  lower(trim(name)),
  '[^a-z0-9]+',
  '-',
  'g'
) || '-' || id
WHERE slug IS NULL OR trim(slug) = '';

UPDATE reviews
SET slug = regexp_replace(slug, '-+', '-', 'g')
WHERE slug IS NOT NULL;

UPDATE reviews
SET slug = regexp_replace(slug, '(^-|-$)', '', 'g')
WHERE slug IS NOT NULL;

-- Public URL constraints.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_slug_key'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_slug_key UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_slug_key'
  ) THEN
    ALTER TABLE team_members ADD CONSTRAINT team_members_slug_key UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'work_items_slug_key'
  ) THEN
    ALTER TABLE work_items ADD CONSTRAINT work_items_slug_key UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_slug_key'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_slug_key UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_rating_range'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_rating_range
      CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- First-party visitor analytics
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_visitors (
  visitor_id           TEXT PRIMARY KEY,
  first_seen_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count          INTEGER NOT NULL DEFAULT 0,
  session_count        INTEGER NOT NULL DEFAULT 0,
  ip_hash              TEXT,
  ip_masked            TEXT,
  user_agent           TEXT,
  browser              TEXT,
  operating_system     TEXT,
  device_type          TEXT,
  language             TEXT,
  languages            TEXT,
  timezone             TEXT,
  platform             TEXT,
  screen_width         INTEGER,
  screen_height        INTEGER,
  viewport_width       INTEGER,
  viewport_height      INTEGER,
  cookies_enabled      BOOLEAN,
  country              TEXT,
  region               TEXT,
  city                 TEXT,
  referrer             TEXT,
  landing_path         TEXT,
  last_path            TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_visit_events (
  id                   BIGSERIAL PRIMARY KEY,
  visitor_id           TEXT NOT NULL
                        REFERENCES site_visitors(visitor_id)
                        ON DELETE CASCADE,
  session_id           TEXT NOT NULL,
  visited_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  path                 TEXT NOT NULL,
  page_title           TEXT,
  referrer             TEXT,
  event_name           TEXT NOT NULL DEFAULT 'page_view'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes used by the public detail pages and dashboard analytics
-- ─────────────────────────────────────────────────────────────────────────────


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM services WHERE slug IS NULL OR trim(slug) = '') THEN
    ALTER TABLE services ALTER COLUMN slug SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM reviews WHERE slug IS NULL OR trim(slug) = '') THEN
    ALTER TABLE reviews ALTER COLUMN slug SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE slug IS NULL OR trim(slug) = '') THEN
    ALTER TABLE team_members ALTER COLUMN slug SET NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM work_items WHERE slug IS NULL OR trim(slug) = '') THEN
    ALTER TABLE work_items ALTER COLUMN slug SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_services_slug
  ON services (slug);

CREATE INDEX IF NOT EXISTS idx_reviews_slug
  ON reviews (slug);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
  ON reviews (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visitors_last_seen
  ON site_visitors (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visitors_device
  ON site_visitors (device_type);

CREATE INDEX IF NOT EXISTS idx_site_visitors_country
  ON site_visitors (country);

CREATE INDEX IF NOT EXISTS idx_site_visitors_last_path
  ON site_visitors (last_path);

CREATE INDEX IF NOT EXISTS idx_site_visit_events_time
  ON site_visit_events (visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visit_events_visitor
  ON site_visit_events (visitor_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visit_events_session
  ON site_visit_events (session_id);

COMMIT;
