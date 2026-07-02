CREATE OR REPLACE FUNCTION public.get_published_exam_standings(_exam_id uuid)
RETURNS TABLE (
  student_id uuid,
  full_name text,
  roll_number integer,
  class_name text,
  total_marks numeric,
  percentage numeric,
  gpa numeric,
  grade text,
  rank integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH published_exam AS (
    SELECT id
    FROM public.exams
    WHERE id = _exam_id
      AND is_published = true
  ),
  saved_results AS (
    SELECT
      sr.student_id,
      s.full_name,
      s.roll_number,
      s.class AS class_name,
      COALESCE(sr.total_marks, 0) AS total_marks,
      COALESCE(sr.percentage, 0) AS percentage,
      COALESCE(sr.gpa, 0) AS gpa,
      COALESCE(sr.grade, 'NG') AS grade,
      COALESCE(sr.rank, 0) AS rank
    FROM public.student_results sr
    JOIN published_exam pe ON pe.id = sr.exam_id
    JOIN public.students s ON s.id = sr.student_id
  ),
  aggregated_marks AS (
    SELECT
      em.student_id,
      s.full_name,
      s.roll_number,
      s.class AS class_name,
      COALESCE(SUM(em.total_marks), 0) AS total_marks,
      CASE
        WHEN COALESCE(SUM(sub.full_marks), 0) > 0
        THEN ROUND((COALESCE(SUM(em.total_marks), 0) / SUM(sub.full_marks)) * 100, 2)
        ELSE 0
      END AS percentage,
      CASE
        WHEN COALESCE(SUM(sub.credit_hours), 0) > 0
        THEN ROUND(SUM(COALESCE(em.grade_point, 0) * COALESCE(sub.credit_hours, 4)) / SUM(COALESCE(sub.credit_hours, 4)), 2)
        ELSE 0
      END AS gpa
    FROM public.exam_marks em
    JOIN published_exam pe ON pe.id = em.exam_id
    JOIN public.students s ON s.id = em.student_id
    JOIN public.subjects sub ON sub.id = em.subject_id
    GROUP BY em.student_id, s.full_name, s.roll_number, s.class
  ),
  ranked_aggregated AS (
    SELECT
      am.student_id,
      am.full_name,
      am.roll_number,
      am.class_name,
      am.total_marks,
      am.percentage,
      am.gpa,
      CASE
        WHEN am.gpa >= 3.6 THEN 'A+'
        WHEN am.gpa >= 3.2 THEN 'A'
        WHEN am.gpa >= 2.8 THEN 'B+'
        WHEN am.gpa >= 2.4 THEN 'B'
        WHEN am.gpa >= 2.0 THEN 'C+'
        WHEN am.gpa >= 1.6 THEN 'C'
        WHEN am.gpa >= 1.2 THEN 'D+'
        WHEN am.gpa >= 0.8 THEN 'D'
        ELSE 'NG'
      END AS grade,
      ROW_NUMBER() OVER (ORDER BY am.gpa DESC, am.total_marks DESC, am.full_name ASC)::integer AS rank
    FROM aggregated_marks am
  )
  SELECT * FROM saved_results
  UNION ALL
  SELECT * FROM ranked_aggregated
  WHERE NOT EXISTS (SELECT 1 FROM saved_results)
  ORDER BY rank ASC, total_marks DESC, full_name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_exam_standings(uuid) TO anon, authenticated, service_role;