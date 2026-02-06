
-- Update the staff role assignment trigger to also handle parent role
CREATE OR REPLACE FUNCTION public.handle_staff_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user info from profiles
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Handle teacher role
  IF NEW.role = 'teacher' THEN
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.teachers (user_id, full_name, email, status)
      VALUES (NEW.user_id, COALESCE(v_user_name, 'Teacher'), v_user_email, 'active');
    END IF;
  END IF;

  -- Handle parent role
  IF NEW.role = 'parent' THEN
    IF NOT EXISTS (SELECT 1 FROM public.parents WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.parents (user_id, full_name, email)
      VALUES (NEW.user_id, COALESCE(v_user_name, 'Parent'), v_user_email);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add RLS policies for parents to view children's data
-- Parents can view their children's attendance
CREATE POLICY "Parents can view children attendance"
  ON public.attendance
  FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Parents can view children's fees
CREATE POLICY "Parents can view children fees"
  ON public.student_fees
  FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Parents can view children's fee payments
CREATE POLICY "Parents can view children payments"
  ON public.fee_payments
  FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Parents can view children's exam marks (published exams only)
CREATE POLICY "Parents can view children exam marks"
  ON public.exam_marks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      JOIN public.exams e ON e.id = exam_marks.exam_id
      WHERE p.user_id = auth.uid()
        AND ps.student_id = exam_marks.student_id
        AND e.is_published = true
    )
  );

-- Parents can view children's student records
CREATE POLICY "Parents can view children records"
  ON public.students
  FOR SELECT
  USING (
    id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Parents can view children's homework submissions
CREATE POLICY "Parents can view children homework submissions"
  ON public.homework_submissions
  FOR SELECT
  USING (
    student_id IN (
      SELECT ps.student_id FROM public.parent_students ps
      JOIN public.parents p ON p.id = ps.parent_id
      WHERE p.user_id = auth.uid()
    )
  );
