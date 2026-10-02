BEGIN;

DO $$
BEGIN
  IF to_regclass('public.user_reviews') IS NOT NULL THEN
    UPDATE public.user_reviews SET email = lower(trim(email)) WHERE email IS NOT NULL;
    WITH ranked AS (
      SELECT id, row_number() OVER (
        PARTITION BY work_id, lower(trim(email))
        ORDER BY created_at ASC, id ASC
      ) AS rn
      FROM public.user_reviews
    )
    DELETE FROM public.user_reviews u USING ranked r
    WHERE u.id = r.id AND r.rn > 1;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_user_reviews_work_email
      ON public.user_reviews(work_id, lower(email));
  END IF;
END $$;

COMMIT;
