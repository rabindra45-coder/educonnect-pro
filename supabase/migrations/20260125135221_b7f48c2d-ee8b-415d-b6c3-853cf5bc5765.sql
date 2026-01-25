-- Create exam types enum
CREATE TYPE public.exam_type AS ENUM ('terminal', 'unit', 'monthly', 'final', 'pre_board');

-- Create subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  full_marks integer NOT NULL DEFAULT 100,
  pass_marks integer NOT NULL DEFAULT 40,
  credit_hours numeric(3,1) DEFAULT 4.0,
  is_optional boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  exam_type exam_type NOT NULL,
  academic_year text NOT NULL,
  class text NOT NULL,
  section text,
  start_date date,
  end_date date,
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create exam_marks table for storing individual student marks
CREATE TABLE public.exam_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  theory_marks numeric(5,2),
  practical_marks numeric(5,2),
  total_marks numeric(5,2),
  grade text,
  grade_point numeric(3,2),
  remarks text,
  entered_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id, subject_id)
);

-- Create student_results table for storing computed results
CREATE TABLE public.student_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  total_marks numeric(6,2),
  percentage numeric(5,2),
  gpa numeric(3,2),
  grade text,
  rank integer,
  total_subjects integer,
  passed_subjects integer,
  result_status text DEFAULT 'pending' CHECK (result_status IN ('pending', 'pass', 'fail', 'withheld')),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Anyone can view active subjects" ON public.subjects
  FOR SELECT USING (is_active = true);

-- Exams policies
CREATE POLICY "Admins can manage exams" ON public.exams
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view published exams" ON public.exams
  FOR SELECT USING (is_published = true);

-- Exam marks policies
CREATE POLICY "Admins can manage exam marks" ON public.exam_marks
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own marks" ON public.exam_marks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN exams e ON e.id = exam_marks.exam_id
      WHERE s.id = exam_marks.student_id 
      AND s.user_id = auth.uid()
      AND e.is_published = true
    )
  );

-- Student results policies
CREATE POLICY "Admins can manage student results" ON public.student_results
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own results" ON public.student_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN exams e ON e.id = student_results.exam_id
      WHERE s.id = student_results.student_id 
      AND s.user_id = auth.uid()
      AND e.is_published = true
    )
  );

-- Create function to calculate NEB grade from marks
CREATE OR REPLACE FUNCTION public.calculate_neb_grade(marks numeric, full_marks numeric)
RETURNS TABLE(grade text, grade_point numeric)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  percentage numeric;
BEGIN
  percentage := (marks / full_marks) * 100;
  
  IF percentage >= 90 THEN
    RETURN QUERY SELECT 'A+'::text, 4.0::numeric;
  ELSIF percentage >= 80 THEN
    RETURN QUERY SELECT 'A'::text, 3.6::numeric;
  ELSIF percentage >= 70 THEN
    RETURN QUERY SELECT 'B+'::text, 3.2::numeric;
  ELSIF percentage >= 60 THEN
    RETURN QUERY SELECT 'B'::text, 2.8::numeric;
  ELSIF percentage >= 50 THEN
    RETURN QUERY SELECT 'C+'::text, 2.4::numeric;
  ELSIF percentage >= 40 THEN
    RETURN QUERY SELECT 'C'::text, 2.0::numeric;
  ELSIF percentage >= 30 THEN
    RETURN QUERY SELECT 'D+'::text, 1.6::numeric;
  ELSIF percentage >= 20 THEN
    RETURN QUERY SELECT 'D'::text, 1.2::numeric;
  ELSE
    RETURN QUERY SELECT 'NG'::text, 0.0::numeric;
  END IF;
END;
$$;

-- Create function to calculate GPA from grade points
CREATE OR REPLACE FUNCTION public.calculate_gpa(p_exam_id uuid, p_student_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  total_credit_hours numeric := 0;
  weighted_grade_points numeric := 0;
  gpa numeric;
BEGIN
  SELECT 
    COALESCE(SUM(s.credit_hours), 0),
    COALESCE(SUM(em.grade_point * s.credit_hours), 0)
  INTO total_credit_hours, weighted_grade_points
  FROM exam_marks em
  JOIN subjects s ON s.id = em.subject_id
  WHERE em.exam_id = p_exam_id AND em.student_id = p_student_id;
  
  IF total_credit_hours > 0 THEN
    gpa := ROUND(weighted_grade_points / total_credit_hours, 2);
  ELSE
    gpa := 0;
  END IF;
  
  RETURN gpa;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_marks_updated_at
  BEFORE UPDATE ON public.exam_marks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_results_updated_at
  BEFORE UPDATE ON public.student_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();