-- Create student_documents table to store documents for students
CREATE TABLE public.student_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'character_certificate', 'grade_sheet', 'see_certificate', etc.
  title TEXT NOT NULL,
  serial_number TEXT,
  document_data JSONB DEFAULT '{}', -- Store additional document-specific data
  document_image_url TEXT, -- For uploaded document images
  issued_date DATE DEFAULT CURRENT_DATE,
  issued_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage student documents"
ON public.student_documents
FOR ALL
USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own documents"
ON public.student_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = student_documents.student_id 
    AND students.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_student_documents_student_id ON public.student_documents(student_id);
CREATE INDEX idx_student_documents_type ON public.student_documents(document_type);