-- Create table to store face recognition data for students
CREATE TABLE public.student_face_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  face_image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.student_face_data ENABLE ROW LEVEL SECURITY;

-- Students can only view/manage their own face data
CREATE POLICY "Students can view their own face data"
ON public.student_face_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own face data"
ON public.student_face_data
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Students can update their own face data"
ON public.student_face_data
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own face data"
ON public.student_face_data
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_student_face_data_updated_at
BEFORE UPDATE ON public.student_face_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();