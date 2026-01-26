-- Create parents table for parent-student linking
CREATE TABLE public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  occupation text,
  photo_url text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": true}'::jsonb,
  language_preference text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Parent-student linking table (one parent can have multiple children)
CREATE TABLE public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  relationship text DEFAULT 'guardian',
  is_primary boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Teacher assignments table
CREATE TABLE public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  class text NOT NULL,
  section text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  is_class_teacher boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class, section, subject_id, academic_year)
);

-- Homework/assignments table
CREATE TABLE public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  class text NOT NULL,
  section text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  attachment_url text,
  due_date date NOT NULL,
  allow_late_submission boolean DEFAULT false,
  max_marks integer DEFAULT 100,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Homework submissions
CREATE TABLE public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid REFERENCES public.homework(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  submission_url text,
  submission_text text,
  submitted_at timestamptz DEFAULT now(),
  is_late boolean DEFAULT false,
  marks integer,
  remarks text,
  graded_by uuid,
  graded_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(homework_id, student_id)
);

-- School expenses table
CREATE TABLE public.school_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  vendor_name text,
  receipt_url text,
  payment_method text DEFAULT 'cash',
  approved_by uuid,
  recorded_by uuid,
  department text,
  academic_year text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Budget allocations
CREATE TABLE public.budget_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  academic_year text NOT NULL,
  allocated_amount numeric NOT NULL DEFAULT 0,
  spent_amount numeric NOT NULL DEFAULT 0,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(department, academic_year)
);

-- Digital library resources
CREATE TABLE public.digital_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'ebook',
  file_url text NOT NULL,
  cover_image_url text,
  subject text,
  class text,
  author text,
  publisher text,
  is_downloadable boolean DEFAULT false,
  access_level text DEFAULT 'all',
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  uploaded_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Book reservations
CREATE TABLE public.book_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  reservation_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date NOT NULL,
  status text DEFAULT 'pending',
  processed_by uuid,
  processed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Library memberships
CREATE TABLE public.library_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_type text NOT NULL DEFAULT 'student',
  member_id uuid NOT NULL,
  membership_number text UNIQUE,
  max_books integer DEFAULT 3,
  membership_start date DEFAULT CURRENT_DATE,
  membership_end date,
  status text DEFAULT 'active',
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Teacher timetable
CREATE TABLE public.teacher_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period_number integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  class text NOT NULL,
  section text,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  room text,
  academic_year text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Teacher leave requests
CREATE TABLE public.teacher_leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Parent-teacher meetings
CREATE TABLE public.parent_teacher_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  meeting_date date NOT NULL,
  meeting_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  purpose text,
  status text DEFAULT 'scheduled',
  meeting_link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Messages system
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  sender_type text NOT NULL,
  recipient_id uuid NOT NULL,
  recipient_type text NOT NULL,
  subject text,
  content text NOT NULL,
  attachment_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  parent_message_id uuid REFERENCES public.messages(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Certificate requests
CREATE TABLE public.certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  requested_by uuid NOT NULL,
  certificate_type text NOT NULL,
  purpose text,
  status text DEFAULT 'pending',
  processed_by uuid,
  processed_at timestamptz,
  document_id uuid REFERENCES public.student_documents(id),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Question bank
CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  question_type text DEFAULT 'objective',
  options jsonb,
  correct_answer text,
  marks integer DEFAULT 1,
  difficulty text DEFAULT 'medium',
  chapter text,
  topic text,
  class text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add user_id to teachers table for linking
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Enable RLS on all new tables
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON public.parent_students(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework(class, section);
CREATE INDEX IF NOT EXISTS idx_homework_subject ON public.homework(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetable_teacher ON public.teacher_timetable(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_book_reservations_book ON public.book_reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_school_expenses_date ON public.school_expenses(expense_date);