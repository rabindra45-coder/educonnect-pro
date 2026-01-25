
-- Create books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn text UNIQUE,
  title text NOT NULL,
  author text NOT NULL,
  publisher text,
  category text DEFAULT 'general',
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  pdf_url text,
  cover_image_url text,
  description text,
  published_year integer,
  shelf_location text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create book issues table
CREATE TABLE public.book_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  issued_by uuid REFERENCES auth.users(id),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  return_date date,
  returned_to uuid REFERENCES auth.users(id),
  status text DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create library fines table
CREATE TABLE public.library_fines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_issue_id uuid REFERENCES public.book_issues(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  fine_amount numeric(10,2) NOT NULL,
  fine_reason text NOT NULL,
  days_overdue integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
  paid_date date,
  paid_amount numeric(10,2) DEFAULT 0,
  waived_by uuid REFERENCES auth.users(id),
  waive_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create library settings table
CREATE TABLE public.library_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_per_day numeric(10,2) DEFAULT 5.00,
  max_books_per_student integer DEFAULT 3,
  default_issue_days integer DEFAULT 14,
  lost_book_fine_multiplier numeric DEFAULT 2.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default library settings
INSERT INTO public.library_settings (fine_per_day, max_books_per_student, default_issue_days)
VALUES (5.00, 3, 14);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;

-- Create helper function for librarian role check
CREATE OR REPLACE FUNCTION public.is_librarian(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'librarian')
  )
$$;

-- RLS Policies for books
CREATE POLICY "Anyone can view active books"
ON public.books FOR SELECT
USING (is_active = true);

CREATE POLICY "Librarians can manage books"
ON public.books FOR ALL
USING (is_librarian(auth.uid()));

-- RLS Policies for book_issues
CREATE POLICY "Librarians can manage book issues"
ON public.book_issues FOR ALL
USING (is_librarian(auth.uid()));

CREATE POLICY "Students can view their own issues"
ON public.book_issues FOR SELECT
USING (EXISTS (
  SELECT 1 FROM students s
  WHERE s.id = book_issues.student_id AND s.user_id = auth.uid()
));

-- RLS Policies for library_fines
CREATE POLICY "Librarians can manage fines"
ON public.library_fines FOR ALL
USING (is_librarian(auth.uid()));

CREATE POLICY "Students can view their own fines"
ON public.library_fines FOR SELECT
USING (EXISTS (
  SELECT 1 FROM students s
  WHERE s.id = library_fines.student_id AND s.user_id = auth.uid()
));

-- RLS Policies for library_settings
CREATE POLICY "Anyone can view library settings"
ON public.library_settings FOR SELECT
USING (true);

CREATE POLICY "Librarians can manage settings"
ON public.library_settings FOR ALL
USING (is_librarian(auth.uid()));

-- Function to update book available copies on issue
CREATE OR REPLACE FUNCTION public.update_book_copies_on_issue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books SET available_copies = available_copies - 1 WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned' THEN
    UPDATE books SET available_copies = available_copies + 1 WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for book copies
CREATE TRIGGER on_book_issue_update_copies
AFTER INSERT OR UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_book_copies_on_issue();

-- Function to calculate fine on return
CREATE OR REPLACE FUNCTION public.calculate_library_fine()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fine_rate numeric;
  days_late integer;
  fine_total numeric;
BEGIN
  IF NEW.status = 'returned' AND OLD.status = 'issued' THEN
    SELECT fine_per_day INTO fine_rate FROM library_settings LIMIT 1;
    days_late := NEW.return_date - NEW.due_date;
    
    IF days_late > 0 THEN
      fine_total := days_late * fine_rate;
      INSERT INTO library_fines (book_issue_id, student_id, fine_amount, fine_reason, days_overdue)
      VALUES (NEW.id, NEW.student_id, fine_total, 'Late return', days_late);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for fine calculation
CREATE TRIGGER on_book_return_calculate_fine
AFTER UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.calculate_library_fine();

-- Insert sample books
INSERT INTO public.books (isbn, title, author, publisher, category, total_copies, available_copies, published_year, shelf_location, description) VALUES
('978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 'Fiction', 5, 5, 1960, 'A-101', 'A classic of modern American literature.'),
('978-0-452-28423-4', '1984', 'George Orwell', 'Secker & Warburg', 'Fiction', 4, 4, 1949, 'A-102', 'A dystopian social science fiction novel.'),
('978-0-7432-7356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 'Fiction', 3, 3, 1925, 'A-103', 'A novel set in the Jazz Age on Long Island.'),
('978-0-14-028329-7', 'The Catcher in the Rye', 'J.D. Salinger', 'Little, Brown', 'Fiction', 4, 4, 1951, 'A-104', 'A novel about teenage alienation and loss of innocence.'),
('978-0-316-76948-0', 'Pride and Prejudice', 'Jane Austen', 'T. Egerton', 'Fiction', 5, 5, 1813, 'A-105', 'A romantic novel of manners.'),
('978-0-06-093546-7', 'Study Guide Collection', 'SparkNotes', 'SparkNotes', 'Study Guide', 10, 10, 2002, 'B-201', 'Comprehensive study guides for students.'),
('978-0-13-468599-1', 'Physics: Principles with Applications', 'Douglas C. Giancoli', 'Pearson', 'Science', 8, 8, 2014, 'C-301', 'Comprehensive physics textbook.'),
('978-0-321-74763-1', 'Chemistry: The Central Science', 'Brown, LeMay, Bursten', 'Pearson', 'Science', 6, 6, 2012, 'C-302', 'Foundational chemistry textbook.'),
('978-0-07-340106-5', 'Biology', 'Sylvia S. Mader', 'McGraw-Hill', 'Science', 7, 7, 2010, 'C-303', 'Introduction to biological concepts.'),
('978-0-13-468157-3', 'Calculus: Early Transcendentals', 'James Stewart', 'Cengage', 'Mathematics', 5, 5, 2015, 'D-401', 'Comprehensive calculus textbook.'),
('978-0-07-352932-5', 'Algebra and Trigonometry', 'Robert Blitzer', 'McGraw-Hill', 'Mathematics', 6, 6, 2014, 'D-402', 'Foundation for advanced mathematics.'),
('978-0-19-953556-8', 'Oxford English Dictionary', 'Oxford University Press', 'Oxford', 'Reference', 3, 3, 2010, 'E-501', 'Comprehensive English dictionary.'),
('978-9937-0-0001-1', 'Nepali Byakaran', 'Nepal Academy', 'Nepal Academy', 'Nepali', 10, 10, 2020, 'F-601', 'Nepali grammar textbook for schools.'),
('978-9937-0-0002-8', 'Social Studies Nepal', 'CDC Nepal', 'Janak Education', 'Social Studies', 8, 8, 2022, 'G-701', 'Social studies for secondary level.'),
('978-9937-0-0003-5', 'Computer Science Fundamentals', 'Ramesh Thapa', 'Ekta Books', 'Computer', 6, 6, 2021, 'H-801', 'Computer science basics for students.');

-- Create indexes for performance
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_book_issues_student ON public.book_issues(student_id);
CREATE INDEX idx_book_issues_status ON public.book_issues(status);
CREATE INDEX idx_library_fines_student ON public.library_fines(student_id);
CREATE INDEX idx_library_fines_status ON public.library_fines(status);
