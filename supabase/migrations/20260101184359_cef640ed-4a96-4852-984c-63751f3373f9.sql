-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-images' AND public.has_any_admin_role(auth.uid()));

-- Allow admins to update images
CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'content-images' AND public.has_any_admin_role(auth.uid()));

-- Allow admins to delete images
CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-images' AND public.has_any_admin_role(auth.uid()));