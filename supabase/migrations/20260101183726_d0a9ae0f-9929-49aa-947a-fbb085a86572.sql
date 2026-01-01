-- Create facilities table for dynamic facilities management
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create about_content table for dynamic about page content
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create leadership table for school leaders
CREATE TABLE public.leadership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  experience TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  rating INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stats table for homepage statistics
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public can view active facilities" ON public.facilities FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Public can view active leadership" ON public.leadership FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active stats" ON public.stats FOR SELECT USING (is_active = true);

-- Admin full access policies
CREATE POLICY "Admins can manage facilities" ON public.facilities FOR ALL USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage leadership" ON public.leadership FOR ALL USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.has_any_admin_role(auth.uid()));
CREATE POLICY "Admins can manage stats" ON public.stats FOR ALL USING (public.has_any_admin_role(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leadership_updated_at BEFORE UPDATE ON public.leadership FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.stats (label, value, icon, display_order) VALUES
('Students Enrolled', '1500+', 'users', 1),
('Qualified Teachers', '75+', 'graduation-cap', 2),
('Years of Excellence', '25+', 'award', 3),
('Success Rate', '98%', 'trending-up', 4);

INSERT INTO public.facilities (title, description, display_order) VALUES
('Modern Classrooms', 'Spacious, well-lit classrooms equipped with modern teaching aids for effective learning.', 1),
('Sports Facilities', 'Large playground and sports equipment for football, volleyball, and other activities.', 2),
('Library & Resources', 'Well-stocked library with thousands of books, journals, and digital resources.', 3);

INSERT INTO public.leadership (name, role, experience, display_order) VALUES
('Mr. Ram Bahadur Sharma', 'Principal', '25+ years', 1),
('Mrs. Sita Kumari Thapa', 'Vice Principal', '20+ years', 2),
('Mr. Hari Prasad Gautam', 'Head Teacher', '18+ years', 3);

INSERT INTO public.about_content (section_key, title, content) VALUES
('history', 'A Legacy of Excellence', 'Shree Durga Saraswati Janata Secondary School was established in 20XX with a vision to provide quality education to the children of our community. What started as a small school with just a handful of students has grown into one of the most respected educational institutions in the region.'),
('vision', 'Our Vision', 'To be a leading educational institution that nurtures young minds to become responsible global citizens, equipped with knowledge, skills, and values to contribute positively to society and lead fulfilling lives.'),
('mission', 'Our Mission', 'To provide quality education that fosters academic excellence, creativity, critical thinking, and moral values. We are committed to creating a nurturing environment where every student can discover and develop their unique potential.'),
('principal_message', 'From the Principal', 'Education is not just about academic excellence; it is about nurturing well-rounded individuals who will contribute positively to society. At Shree Durga Saraswati Janata Secondary School, we believe in holistic development that encompasses intellectual growth, moral values, and life skills.');