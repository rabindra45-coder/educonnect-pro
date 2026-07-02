DROP FUNCTION IF EXISTS public.get_published_exam_standings(uuid);

CREATE TABLE IF NOT EXISTS public.public_exam_standings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  roll_number integer,
  class_name text,
  total_marks numeric NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  gpa numeric NOT NULL DEFAULT 0,
  grade text NOT NULL DEFAULT 'NG',
  rank integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

GRANT SELECT ON public.public_exam_standings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_exam_standings TO authenticated;
GRANT ALL ON public.public_exam_standings TO service_role;

ALTER TABLE public.public_exam_standings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published public standings" ON public.public_exam_standings;
CREATE POLICY "Anyone can view published public standings"
ON public.public_exam_standings
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.id = public_exam_standings.exam_id
      AND e.is_published = true
  )
  OR public.has_any_admin_role(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage public standings" ON public.public_exam_standings;
CREATE POLICY "Admins can manage public standings"
ON public.public_exam_standings
FOR ALL
TO authenticated
USING (public.has_any_admin_role(auth.uid()))
WITH CHECK (public.has_any_admin_role(auth.uid()));

CREATE OR REPLACE FUNCTION public.sync_public_exam_standing_from_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student record;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_exam_standings
    WHERE exam_id = OLD.exam_id AND student_id = OLD.student_id;
    RETURN OLD;
  END IF;

  SELECT full_name, roll_number, class
  INTO v_student
  FROM public.students
  WHERE id = NEW.student_id;

  IF v_student.full_name IS NOT NULL THEN
    INSERT INTO public.public_exam_standings (
      exam_id,
      student_id,
      full_name,
      roll_number,
      class_name,
      total_marks,
      percentage,
      gpa,
      grade,
      rank,
      updated_at
    ) VALUES (
      NEW.exam_id,
      NEW.student_id,
      v_student.full_name,
      v_student.roll_number,
      v_student.class,
      COALESCE(NEW.total_marks, 0),
      COALESCE(NEW.percentage, 0),
      COALESCE(NEW.gpa, 0),
      COALESCE(NEW.grade, 'NG'),
      COALESCE(NEW.rank, 0),
      now()
    )
    ON CONFLICT (exam_id, student_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      roll_number = EXCLUDED.roll_number,
      class_name = EXCLUDED.class_name,
      total_marks = EXCLUDED.total_marks,
      percentage = EXCLUDED.percentage,
      gpa = EXCLUDED.gpa,
      grade = EXCLUDED.grade,
      rank = EXCLUDED.rank,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_public_exam_standing_from_result_trigger ON public.student_results;
CREATE TRIGGER sync_public_exam_standing_from_result_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.student_results
FOR EACH ROW EXECUTE FUNCTION public.sync_public_exam_standing_from_result();

CREATE OR REPLACE FUNCTION public.sync_public_exam_standing_student_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.public_exam_standings
  SET full_name = NEW.full_name,
      roll_number = NEW.roll_number,
      class_name = NEW.class,
      updated_at = now()
  WHERE student_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_public_exam_standing_student_fields_trigger ON public.students;
CREATE TRIGGER sync_public_exam_standing_student_fields_trigger
AFTER UPDATE OF full_name, roll_number, class ON public.students
FOR EACH ROW EXECUTE FUNCTION public.sync_public_exam_standing_student_fields();