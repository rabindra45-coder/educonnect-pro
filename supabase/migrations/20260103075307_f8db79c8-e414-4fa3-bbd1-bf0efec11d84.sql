-- Add principal years experience column to school_settings
ALTER TABLE public.school_settings 
ADD COLUMN IF NOT EXISTS principal_years_experience integer DEFAULT 25;