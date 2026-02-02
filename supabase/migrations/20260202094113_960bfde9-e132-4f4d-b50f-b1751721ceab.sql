-- Add RLS policy to allow teachers to view their own profile
CREATE POLICY "Teachers can view own profile" 
ON public.teachers 
FOR SELECT 
USING (user_id = auth.uid());

-- Add RLS policy to allow teachers to update their own profile
CREATE POLICY "Teachers can update own profile" 
ON public.teachers 
FOR UPDATE 
USING (user_id = auth.uid());