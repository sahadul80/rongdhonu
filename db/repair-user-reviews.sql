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

UPDATE public.user_reviews
SET email = lower(trim(email))
WHERE email IS NOT NULL;

WITH ranked AS (
  SELECT id, row_number() OVER (
    PARTITION BY work_id, lower(trim(email))
    ORDER BY created_at ASC, id ASC
  ) AS rn
  FROM public.user_reviews
)
DELETE FROM public.user_reviews u
USING ranked r
WHERE u.id = r.id AND r.rn > 1;

CREATE INDEX IF NOT EXISTS idx_user_reviews_work_status
  ON public.user_reviews(work_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at
  ON public.user_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_consent
  ON public.user_reviews(consent_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_identity
  ON public.user_reviews(work_id, identity_provider, identity_subject);
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_email
  ON public.user_reviews(work_id, lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_identity
  ON public.user_reviews(work_id, identity_provider, identity_subject)
  WHERE identity_provider IS NOT NULL AND identity_subject IS NOT NULL;

COMMIT;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_reviews'
ORDER BY ordinal_position;
