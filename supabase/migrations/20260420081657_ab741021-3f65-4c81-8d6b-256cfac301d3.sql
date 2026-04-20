CREATE POLICY "Public can view students for QR verification"
ON public.students
FOR SELECT
TO anon, authenticated
USING (true);