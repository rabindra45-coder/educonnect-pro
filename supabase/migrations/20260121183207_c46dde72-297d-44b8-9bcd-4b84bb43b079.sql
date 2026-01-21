-- Add storage policy to allow students to upload their own profile photos
CREATE POLICY "Students can upload their own photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content-images' 
  AND (storage.foldername(name))[1] = 'students'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'student')
);

-- Allow students to update their own photos
CREATE POLICY "Students can update their own photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'content-images' 
  AND (storage.foldername(name))[1] = 'students'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'student')
);

-- Allow students to delete their own photos
CREATE POLICY "Students can delete their own photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content-images' 
  AND (storage.foldername(name))[1] = 'students'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'student')
);