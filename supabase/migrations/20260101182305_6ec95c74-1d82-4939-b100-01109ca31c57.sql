-- Create gallery_images table for admin-managed gallery
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  album TEXT NOT NULL DEFAULT 'campus',
  image_url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery images
CREATE POLICY "Anyone can view gallery images" 
ON public.gallery_images 
FOR SELECT 
USING (true);

-- Admins can manage gallery images
CREATE POLICY "Admins can manage gallery images" 
ON public.gallery_images 
FOR ALL 
USING (has_any_admin_role(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create academic_calendar table
CREATE TABLE public.academic_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

-- Anyone can view calendar
CREATE POLICY "Anyone can view academic calendar" 
ON public.academic_calendar 
FOR SELECT 
USING (true);

-- Admins can manage calendar
CREATE POLICY "Admins can manage academic calendar" 
ON public.academic_calendar 
FOR ALL 
USING (has_any_admin_role(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_academic_calendar_updated_at
BEFORE UPDATE ON public.academic_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create exam_results table
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  class TEXT NOT NULL,
  result_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Anyone can view published results
CREATE POLICY "Anyone can view published exam results" 
ON public.exam_results 
FOR SELECT 
USING (is_published = true);

-- Admins can manage exam results
CREATE POLICY "Admins can manage exam results" 
ON public.exam_results 
FOR ALL 
USING (has_any_admin_role(auth.uid()));