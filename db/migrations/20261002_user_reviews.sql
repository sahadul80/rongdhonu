BEGIN;

CREATE TABLE IF NOT EXISTS public.user_reviews (
  id BIGSERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES public.work_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  owner_token_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','visible','hidden')),
  identity_provider TEXT,
  identity_subject TEXT,
  consent_version TEXT,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS owner_token_hash TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_provider TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS identity_subject TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_version TEXT;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
ALTER TABLE public.user_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.user_reviews
SET owner_token_hash = md5(id::text || ':' || email)
WHERE owner_token_hash IS NULL OR trim(owner_token_hash) = '';

CREATE INDEX IF NOT EXISTS idx_user_reviews_work_status
  ON public.user_reviews(work_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at
  ON public.user_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_consent
  ON public.user_reviews(consent_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_identity
  ON public.user_reviews(work_id, identity_provider, identity_subject);

COMMIT;
