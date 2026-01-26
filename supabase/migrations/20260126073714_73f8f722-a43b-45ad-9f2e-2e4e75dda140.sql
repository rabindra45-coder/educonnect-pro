-- Helper function to check if user is accountant
CREATE OR REPLACE FUNCTION public.is_accountant(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'accountant')
  )
$$;

-- Helper function to check if user is parent
CREATE OR REPLACE FUNCTION public.is_parent(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'parent'
  )
$$;

-- Helper function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'teacher'
  )
$$;

-- Helper function to get teacher_id from user_id
CREATE OR REPLACE FUNCTION public.get_teacher_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.teachers WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function to get parent_id from user_id
CREATE OR REPLACE FUNCTION public.get_parent_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.parents WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for parents
CREATE POLICY "Parents can view own profile" ON public.parents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Parents can update own profile" ON public.parents FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage parents" ON public.parents FOR ALL USING (has_any_admin_role(auth.uid()));

-- RLS Policies for parent_students
CREATE POLICY "Parents can view own children" ON public.parent_students FOR SELECT 
  USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage parent-student links" ON public.parent_students FOR ALL 
  USING (has_any_admin_role(auth.uid()));

-- RLS Policies for teacher_assignments
CREATE POLICY "Teachers can view own assignments" ON public.teacher_assignments FOR SELECT 
  USING (teacher_id = get_teacher_id(auth.uid()) OR has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage assignments" ON public.teacher_assignments FOR ALL 
  USING (has_any_admin_role(auth.uid()));

-- RLS Policies for homework
CREATE POLICY "Teachers can manage own homework" ON public.homework FOR ALL 
  USING (teacher_id = get_teacher_id(auth.uid()) OR has_any_admin_role(auth.uid()));
CREATE POLICY "Students can view homework for their class" ON public.homework FOR SELECT 
  USING (is_published = true);
CREATE POLICY "Parents can view homework" ON public.homework FOR SELECT 
  USING (is_published = true AND is_parent(auth.uid()));

-- RLS Policies for homework_submissions
CREATE POLICY "Students can manage own submissions" ON public.homework_submissions FOR ALL 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Teachers can view grade submissions" ON public.homework_submissions FOR ALL 
  USING (is_teacher(auth.uid()) OR has_any_admin_role(auth.uid()));
CREATE POLICY "Parents can view child submissions" ON public.homework_submissions FOR SELECT 
  USING (student_id IN (
    SELECT student_id FROM public.parent_students 
    WHERE parent_id = get_parent_id(auth.uid())
  ));

-- RLS Policies for school_expenses
CREATE POLICY "Accountants can manage expenses" ON public.school_expenses FOR ALL 
  USING (is_accountant(auth.uid()));

-- RLS Policies for budget_allocations
CREATE POLICY "Accountants can manage budgets" ON public.budget_allocations FOR ALL 
  USING (is_accountant(auth.uid()));

-- RLS Policies for digital_resources
CREATE POLICY "Anyone can view active resources" ON public.digital_resources FOR SELECT 
  USING (is_active = true);
CREATE POLICY "Librarians can manage resources" ON public.digital_resources FOR ALL 
  USING (is_librarian(auth.uid()));

-- RLS Policies for book_reservations
CREATE POLICY "Students can manage own reservations" ON public.book_reservations FOR ALL 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Librarians can manage reservations" ON public.book_reservations FOR ALL 
  USING (is_librarian(auth.uid()));

-- RLS Policies for library_memberships
CREATE POLICY "Members can view own membership" ON public.library_memberships FOR SELECT 
  USING (true);
CREATE POLICY "Librarians can manage memberships" ON public.library_memberships FOR ALL 
  USING (is_librarian(auth.uid()));

-- RLS Policies for teacher_timetable
CREATE POLICY "Teachers can view own timetable" ON public.teacher_timetable FOR SELECT 
  USING (teacher_id = get_teacher_id(auth.uid()) OR has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage timetables" ON public.teacher_timetable FOR ALL 
  USING (has_any_admin_role(auth.uid()));

-- RLS Policies for teacher_leave_requests
CREATE POLICY "Teachers can manage own leave" ON public.teacher_leave_requests FOR ALL 
  USING (teacher_id = get_teacher_id(auth.uid()));
CREATE POLICY "Admins can manage all leave" ON public.teacher_leave_requests FOR ALL 
  USING (has_any_admin_role(auth.uid()));

-- RLS Policies for parent_teacher_meetings
CREATE POLICY "Parents can manage own meetings" ON public.parent_teacher_meetings FOR ALL 
  USING (parent_id = get_parent_id(auth.uid()));
CREATE POLICY "Teachers can manage own meetings" ON public.parent_teacher_meetings FOR ALL 
  USING (teacher_id = get_teacher_id(auth.uid()));
CREATE POLICY "Admins can manage all meetings" ON public.parent_teacher_meetings FOR ALL 
  USING (has_any_admin_role(auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT 
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT 
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipients can update read status" ON public.messages FOR UPDATE 
  USING (recipient_id = auth.uid());

-- RLS Policies for certificate_requests
CREATE POLICY "Users can request certificates" ON public.certificate_requests FOR ALL 
  USING (requested_by = auth.uid() OR has_any_admin_role(auth.uid()));
CREATE POLICY "Students can request own certificates" ON public.certificate_requests FOR ALL 
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- RLS Policies for question_bank
CREATE POLICY "Teachers can manage own questions" ON public.question_bank FOR ALL 
  USING (teacher_id = get_teacher_id(auth.uid()) OR has_any_admin_role(auth.uid()));