BEGIN;

DO $$
BEGIN
  IF to_regclass('public.contact_submissions') IS NOT NULL THEN
    ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS consent_version TEXT;
    ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS idx_contact_submissions_consent
      ON public.contact_submissions(consent_at DESC);
  END IF;

  IF to_regclass('public.user_reviews') IS NOT NULL THEN
    ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_version TEXT;
    ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS idx_user_reviews_consent
      ON public.user_reviews(consent_at DESC);
  END IF;
END $$;

COMMIT;
