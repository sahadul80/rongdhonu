-- Rong Dhonu — Neon Data API security configuration
-- Run this AFTER enabling Neon Data API on the production branch.
-- The Data API is PostgREST-compatible. These policies allow anonymous/authenticated
-- users to READ public website content while denying Data API writes to those roles.
-- The protected admin APIs continue to use the server-side DATABASE_URL.

-- Public website tables
ALTER TABLE business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Private/admin tables: no SELECT/INSERT/UPDATE/DELETE policies are created for
-- Data API roles, so RLS remains default-deny for the Data API.
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_profile' AND policyname = 'Public can read business profile') THEN
    CREATE POLICY "Public can read business profile" ON business_profile FOR SELECT TO anonymous USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_profile' AND policyname = 'Authenticated can read business profile') THEN
    CREATE POLICY "Authenticated can read business profile" ON business_profile FOR SELECT TO authenticated USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'services' AND policyname = 'Public can read active services') THEN
    CREATE POLICY "Public can read active services" ON services FOR SELECT TO anonymous USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'services' AND policyname = 'Authenticated can read active services') THEN
    CREATE POLICY "Authenticated can read active services" ON services FOR SELECT TO authenticated USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Public can read active team') THEN
    CREATE POLICY "Public can read active team" ON team_members FOR SELECT TO anonymous USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Authenticated can read active team') THEN
    CREATE POLICY "Authenticated can read active team" ON team_members FOR SELECT TO authenticated USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_items' AND policyname = 'Public can read active work') THEN
    CREATE POLICY "Public can read active work" ON work_items FOR SELECT TO anonymous USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'work_items' AND policyname = 'Authenticated can read active work') THEN
    CREATE POLICY "Authenticated can read active work" ON work_items FOR SELECT TO authenticated USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Public can read active reviews') THEN
    CREATE POLICY "Public can read active reviews" ON reviews FOR SELECT TO anonymous USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Authenticated can read active reviews') THEN
    CREATE POLICY "Authenticated can read active reviews" ON reviews FOR SELECT TO authenticated USING (active = true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hero_images' AND policyname = 'Public can read hero images') THEN
    CREATE POLICY "Public can read hero images" ON hero_images FOR SELECT TO anonymous USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'hero_images' AND policyname = 'Authenticated can read hero images') THEN
    CREATE POLICY "Authenticated can read hero images" ON hero_images FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Explicitly remove write grants from Data API roles where those roles exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    REVOKE INSERT, UPDATE, DELETE ON business_profile, services, team_members, work_items, reviews, hero_images FROM anonymous;
    REVOKE ALL ON admin_users, contact_submissions, user_reviews FROM anonymous;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE ON business_profile, services, team_members, work_items, reviews, hero_images FROM authenticated;
    REVOKE ALL ON admin_users, contact_submissions, user_reviews FROM authenticated;
  END IF;
END $$;

-- Ensure public reads are granted to the Data API roles where available.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    GRANT SELECT ON business_profile, services, team_members, work_items, reviews, hero_images TO anonymous;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON business_profile, services, team_members, work_items, reviews, hero_images TO authenticated;
  END IF;
END $$;

-- Refresh PostgREST's schema cache after applying the policies.
NOTIFY pgrst, 'reload schema';
