
-- ============================================================
-- DIGITAL RESOURCE CENTER — Phase 1 schema
-- ============================================================

-- 1. Extend digital_resources with the new fields
ALTER TABLE public.digital_resources
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS folder_id uuid,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS file_mime text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_prompt text,
  ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowed_roles text[] DEFAULT ARRAY['student','teacher','parent','public'];

-- 2. Resource categories
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  color text,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resource_categories TO anon, authenticated;
GRANT ALL ON public.resource_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.resource_categories TO authenticated;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active categories" ON public.resource_categories
  FOR SELECT USING (is_active = true OR public.has_any_admin_role(auth.uid()));
CREATE POLICY "Admins manage categories" ON public.resource_categories
  FOR ALL USING (public.has_any_admin_role(auth.uid()))
  WITH CHECK (public.has_any_admin_role(auth.uid()));

-- 3. Folders (nested)
CREATE TABLE IF NOT EXISTS public.resource_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.resource_folders(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.resource_categories(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resource_folders TO anon, authenticated;
GRANT ALL ON public.resource_folders TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.resource_folders TO authenticated;
ALTER TABLE public.resource_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads folders" ON public.resource_folders FOR SELECT USING (true);
CREATE POLICY "Admins/teachers manage folders" ON public.resource_folders
  FOR ALL USING (public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid()))
  WITH CHECK (public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid()));

-- 4. Favorites / bookmarks
CREATE TABLE IF NOT EXISTS public.resource_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.digital_resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);
GRANT SELECT, INSERT, DELETE ON public.resource_favorites TO authenticated;
GRANT ALL ON public.resource_favorites TO service_role;
ALTER TABLE public.resource_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.resource_favorites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Download history
CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_id uuid NOT NULL REFERENCES public.digital_resources(id) ON DELETE CASCADE,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);
GRANT SELECT, INSERT ON public.resource_downloads TO authenticated;
GRANT INSERT ON public.resource_downloads TO anon;
GRANT ALL ON public.resource_downloads TO service_role;
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own downloads" ON public.resource_downloads
  FOR SELECT USING (auth.uid() = user_id OR public.has_any_admin_role(auth.uid()));
CREATE POLICY "Anyone records a download" ON public.resource_downloads
  FOR INSERT WITH CHECK (true);

-- 6. Ratings
CREATE TABLE IF NOT EXISTS public.resource_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.digital_resources(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);
GRANT SELECT ON public.resource_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.resource_ratings TO authenticated;
GRANT ALL ON public.resource_ratings TO service_role;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads ratings" ON public.resource_ratings FOR SELECT USING (true);
CREATE POLICY "Users manage own rating" ON public.resource_ratings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. FK + indexes on digital_resources
DO $$ BEGIN
  ALTER TABLE public.digital_resources
    ADD CONSTRAINT digital_resources_category_fk
    FOREIGN KEY (category_id) REFERENCES public.resource_categories(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.digital_resources
    ADD CONSTRAINT digital_resources_folder_fk
    FOREIGN KEY (folder_id) REFERENCES public.resource_folders(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_dr_category ON public.digital_resources(category_id);
CREATE INDEX IF NOT EXISTS idx_dr_folder ON public.digital_resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_dr_featured ON public.digital_resources(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_dr_active ON public.digital_resources(is_active, is_archived, deleted_at);
CREATE INDEX IF NOT EXISTS idx_dr_downloads ON public.digital_resources(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_dr_created ON public.digital_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dl_resource ON public.resource_downloads(resource_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dl_user ON public.resource_downloads(user_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_fav_user ON public.resource_favorites(user_id);

-- 8. Allow teachers to upload resources (extend existing policies)
DROP POLICY IF EXISTS "Teachers can upload resources" ON public.digital_resources;
CREATE POLICY "Teachers can upload resources" ON public.digital_resources
  FOR INSERT WITH CHECK (
    public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid())
  );

DROP POLICY IF EXISTS "Teachers manage own resources" ON public.digital_resources;
CREATE POLICY "Teachers manage own resources" ON public.digital_resources
  FOR UPDATE USING (
    public.has_any_admin_role(auth.uid())
    OR (public.is_teacher(auth.uid()) AND uploaded_by = auth.uid())
  );

DROP POLICY IF EXISTS "Teachers delete own resources" ON public.digital_resources;
CREATE POLICY "Teachers delete own resources" ON public.digital_resources
  FOR DELETE USING (
    public.has_any_admin_role(auth.uid())
    OR (public.is_teacher(auth.uid()) AND uploaded_by = auth.uid())
  );

-- 9. Triggers: updated_at + maintain download_count + rating aggregates
CREATE TRIGGER update_resource_categories_updated_at BEFORE UPDATE ON public.resource_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resource_folders_updated_at BEFORE UPDATE ON public.resource_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resource_ratings_updated_at BEFORE UPDATE ON public.resource_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_resource_download()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.digital_resources
    SET download_count = COALESCE(download_count,0) + 1
    WHERE id = NEW.resource_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_increment_resource_download AFTER INSERT ON public.resource_downloads
  FOR EACH ROW EXECUTE FUNCTION public.increment_resource_download();

CREATE OR REPLACE FUNCTION public.recalc_resource_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid uuid;
BEGIN
  rid := COALESCE(NEW.resource_id, OLD.resource_id);
  UPDATE public.digital_resources dr
    SET rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.resource_ratings WHERE resource_id = rid), 0),
        rating_count = COALESCE((SELECT COUNT(*) FROM public.resource_ratings WHERE resource_id = rid), 0)
    WHERE dr.id = rid;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_recalc_resource_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.resource_ratings
  FOR EACH ROW EXECUTE FUNCTION public.recalc_resource_rating();

-- 10. Storage RLS for digital-resources bucket
CREATE POLICY "Authenticated read digital-resources"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'digital-resources');

CREATE POLICY "Public read digital-resources"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'digital-resources');

CREATE POLICY "Admins/teachers upload digital-resources"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'digital-resources'
    AND (public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid()))
  );

CREATE POLICY "Admins/teachers update digital-resources"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'digital-resources'
    AND (public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid()))
  );

CREATE POLICY "Admins/teachers delete digital-resources"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'digital-resources'
    AND (public.has_any_admin_role(auth.uid()) OR public.is_teacher(auth.uid()))
  );

-- 11. Seed default categories
INSERT INTO public.resource_categories (name, slug, icon, color, sort_order) VALUES
  ('Academic Notes', 'academic-notes', 'BookOpen', '#3B82F6', 10),
  ('Assignments', 'assignments', 'ClipboardList', '#8B5CF6', 20),
  ('Question Banks', 'question-banks', 'HelpCircle', '#EC4899', 30),
  ('Past Papers', 'past-papers', 'FileText', '#F59E0B', 40),
  ('Model Questions', 'model-questions', 'FileQuestion', '#10B981', 50),
  ('Syllabus', 'syllabus', 'BookMarked', '#06B6D4', 60),
  ('Books', 'books', 'Book', '#6366F1', 70),
  ('E-books', 'ebooks', 'BookOpenCheck', '#14B8A6', 80),
  ('PDF Documents', 'pdf-documents', 'FileText', '#EF4444', 90),
  ('Images', 'images', 'Image', '#F97316', 100),
  ('Videos', 'videos', 'Video', '#A855F7', 110),
  ('Audio Files', 'audio', 'Music', '#0EA5E9', 120),
  ('Presentations', 'presentations', 'Presentation', '#DB2777', 130),
  ('Projects', 'projects', 'FolderKanban', '#84CC16', 140),
  ('Research Papers', 'research-papers', 'GraduationCap', '#7C3AED', 150),
  ('Forms', 'forms', 'FileSpreadsheet', '#64748B', 160),
  ('Certificates', 'certificates', 'Award', '#EAB308', 170),
  ('ID Card Templates', 'id-cards', 'IdCard', '#0891B2', 180),
  ('Admission Documents', 'admission-docs', 'FilePlus', '#16A34A', 190),
  ('Exam Documents', 'exam-docs', 'FileCheck', '#DC2626', 200),
  ('College Notices', 'notices', 'Bell', '#F59E0B', 210),
  ('Scholarship Information', 'scholarships', 'Trophy', '#FBBF24', 220),
  ('Career Resources', 'career', 'Briefcase', '#0F766E', 230)
ON CONFLICT (slug) DO NOTHING;
