
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS grade text;

-- Best-effort backfill from existing 'class' text
UPDATE public.students
SET grade = CASE
  WHEN class ILIKE '%12%' THEN '12'
  WHEN class ILIKE '%11%' THEN '11'
  ELSE grade
END
WHERE grade IS NULL;

UPDATE public.students
SET stream = CASE
  WHEN class ILIKE '%science%' THEN 'Science'
  WHEN class ILIKE '%management%' THEN 'Management'
  WHEN class ILIKE '%law%' THEN 'Law'
  ELSE stream
END
WHERE stream IS NULL;
