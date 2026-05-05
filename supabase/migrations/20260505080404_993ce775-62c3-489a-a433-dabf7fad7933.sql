
CREATE TABLE public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  intent text,
  agent text,
  status text NOT NULL DEFAULT 'pending',
  result jsonb,
  error text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_id uuid REFERENCES public.ai_logs(id) ON DELETE SET NULL,
  label text NOT NULL,
  summary text,
  target_table text NOT NULL,
  target_id uuid,
  snapshot jsonb NOT NULL,
  applied_changes jsonb,
  rolled_back_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_generated_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_id uuid REFERENCES public.ai_logs(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  purpose text,
  image_url text NOT NULL,
  storage_path text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_ai_logs" ON public.ai_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super_admin_all_ai_versions" ON public.ai_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super_admin_all_ai_media" ON public.ai_generated_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX ai_logs_created_idx ON public.ai_logs(created_at DESC);
CREATE INDEX ai_versions_created_idx ON public.ai_versions(created_at DESC);
CREATE INDEX ai_media_created_idx ON public.ai_generated_media(created_at DESC);
