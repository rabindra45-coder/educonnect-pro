-- Add principal_photo_url column to school_settings
ALTER TABLE public.school_settings 
ADD COLUMN principal_photo_url text DEFAULT '';