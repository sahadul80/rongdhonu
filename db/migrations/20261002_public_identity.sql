BEGIN;

DO $$
BEGIN
  IF to_regclass('public.user_reviews') IS NOT NULL THEN
    ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_provider TEXT;
    ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_subject TEXT;
    CREATE INDEX IF NOT EXISTS idx_user_reviews_identity
      ON public.user_reviews(work_id, identity_provider, identity_subject);
    CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_identity
      ON public.user_reviews(work_id, identity_provider, identity_subject)
      WHERE identity_provider IS NOT NULL AND identity_subject IS NOT NULL;
  END IF;
END $$;

COMMIT;
