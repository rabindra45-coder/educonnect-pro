ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS class text DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS stream text DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS is_practical boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS theory_full_marks integer DEFAULT 75,
  ADD COLUMN IF NOT EXISTS practical_full_marks integer DEFAULT 25;

CREATE INDEX IF NOT EXISTS idx_subjects_class_stream ON public.subjects(class, stream) WHERE is_active = true;

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS stream text DEFAULT 'common';

COMMENT ON COLUMN public.subjects.class IS '11, 12, or both';
COMMENT ON COLUMN public.subjects.stream IS 'science, management, law, or common';
COMMENT ON COLUMN public.exams.stream IS 'science, management, law, or common';