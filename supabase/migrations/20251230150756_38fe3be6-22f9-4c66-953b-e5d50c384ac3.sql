-- Create school_settings table for storing school information
CREATE TABLE public.school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL DEFAULT 'Shree Durga Saraswati Janata Secondary School',
  school_address text DEFAULT 'Kathmandu, Nepal',
  school_phone text DEFAULT '',
  school_email text DEFAULT '',
  school_website text DEFAULT '',
  principal_name text DEFAULT '',
  principal_message text DEFAULT '',
  established_year integer DEFAULT 2000,
  logo_url text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view school settings (public info)
CREATE POLICY "Anyone can view school settings"
ON public.school_settings
FOR SELECT
USING (true);

-- Only admins can update school settings
CREATE POLICY "Admins can update school settings"
ON public.school_settings
FOR UPDATE
USING (has_any_admin_role(auth.uid()));

-- Only super_admin can insert/delete
CREATE POLICY "Super admins can manage school settings"
ON public.school_settings
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_school_settings_updated_at
BEFORE UPDATE ON public.school_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.school_settings (school_name, school_address, school_phone, school_email)
VALUES (
  'Shree Durga Saraswati Janata Secondary School',
  'Kathmandu, Nepal',
  '+977-1-1234567',
  'info@shreeschool.edu.np'
);