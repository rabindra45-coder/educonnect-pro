
-- 1. Tighten has_any_admin_role: remove teacher/staff
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'accountant')
  )
$$;

-- 2. STUDENTS: drop public, add minimal verification function
DROP POLICY IF EXISTS "Public can view students for QR verification" ON public.students;

CREATE OR REPLACE FUNCTION public.get_student_verification(_student_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  registration_number text,
  class text,
  section text,
  roll_number integer,
  photo_url text,
  status text,
  admission_year integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.id, s.full_name, s.registration_number, s.class, s.section,
         s.roll_number, s.photo_url, s.status, s.admission_year
  FROM public.students s
  WHERE s.id = _student_id
$$;

GRANT EXECUTE ON FUNCTION public.get_student_verification(uuid) TO anon, authenticated;

-- 3. TEACHERS: restrict to authenticated users only
DROP POLICY IF EXISTS "Public can view teachers" ON public.teachers;
CREATE POLICY "Authenticated can view active teachers"
  ON public.teachers FOR SELECT
  TO authenticated
  USING (status = 'active');

-- 4. CHAT_CONVERSATIONS: scope select/update to owner (visitor_id) or admin
DROP POLICY IF EXISTS "Visitors can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Visitors can update their own conversations" ON public.chat_conversations;

CREATE POLICY "Owners or admins can view conversations"
  ON public.chat_conversations FOR SELECT
  USING (
    public.has_any_admin_role(auth.uid())
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Admins can update conversations"
  ON public.chat_conversations FOR UPDATE
  USING (public.has_any_admin_role(auth.uid()));

-- 5. CHAT_MESSAGES: restrict reads
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
CREATE POLICY "Owners or admins can view messages"
  ON public.chat_messages FOR SELECT
  USING (
    public.has_any_admin_role(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND auth.uid() IS NOT NULL
        AND c.user_id = auth.uid()
    )
  );

-- 6. LIBRARY MEMBERSHIPS: scope to owner
DROP POLICY IF EXISTS "Members can view own membership" ON public.library_memberships;
CREATE POLICY "Members can view own membership"
  ON public.library_memberships FOR SELECT
  TO authenticated
  USING (
    public.is_librarian(auth.uid())
    OR member_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
      UNION
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  );

-- 7. PAYMENT_QR_CODES: restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view active QR codes" ON public.payment_qr_codes;
CREATE POLICY "Authenticated can view active QR codes"
  ON public.payment_qr_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 8. payment-proofs bucket: make private + scoped policies
UPDATE storage.buckets SET public = false WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Anyone can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;

CREATE POLICY "Admins can view payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.has_any_admin_role(auth.uid())
  );

CREATE POLICY "Authenticated can upload payment proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
  );
