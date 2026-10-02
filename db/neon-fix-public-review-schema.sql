BEGIN;

ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS owner_token_hash TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_provider TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_subject TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_version TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.user_reviews
SET owner_token_hash = md5(id::text || ':' || email)
WHERE owner_token_hash IS NULL OR trim(owner_token_hash) = '';

UPDATE public.user_reviews
SET email = lower(trim(email))
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_reviews_identity
  ON public.user_reviews(work_id, identity_provider, identity_subject);
CREATE INDEX IF NOT EXISTS idx_user_reviews_consent
  ON public.user_reviews(consent_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_email
  ON public.user_reviews(work_id, lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_identity
  ON public.user_reviews(work_id, identity_provider, identity_subject)
  WHERE identity_provider IS NOT NULL AND identity_subject IS NOT NULL;

COMMIT;
