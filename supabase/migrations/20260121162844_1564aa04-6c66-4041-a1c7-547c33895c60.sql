-- Add user_id column to students table to properly link students with auth users
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Update RLS policy to allow students to view their own record
CREATE POLICY "Students can view their own record" 
ON public.students 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow students to update their own contact details
CREATE POLICY "Students can update their own contact details" 
ON public.students 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);