-- Create attendance status enum
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Create attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time time,
  check_out_time time,
  remarks text,
  marked_by uuid REFERENCES auth.users(id),
  notification_sent boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS policies for attendance
CREATE POLICY "Admins can manage attendance"
  ON public.attendance FOR ALL
  USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own attendance"
  ON public.attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = attendance.student_id AND s.user_id = auth.uid()
  ));

-- Create attendance summary view for monthly reports
CREATE OR REPLACE VIEW public.attendance_summary AS
SELECT 
  s.id as student_id,
  s.full_name,
  s.class,
  s.section,
  s.roll_number,
  s.guardian_email,
  s.guardian_phone,
  DATE_TRUNC('month', a.date) as month,
  COUNT(*) FILTER (WHERE a.status = 'present') as present_days,
  COUNT(*) FILTER (WHERE a.status = 'absent') as absent_days,
  COUNT(*) FILTER (WHERE a.status = 'late') as late_days,
  COUNT(*) FILTER (WHERE a.status = 'excused') as excused_days,
  COUNT(*) as total_days,
  ROUND(
    (COUNT(*) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as attendance_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.full_name, s.class, s.section, s.roll_number, s.guardian_email, s.guardian_phone, DATE_TRUNC('month', a.date);

-- Create index for faster queries
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_date ON public.attendance(date);

-- Update trigger for updated_at
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();