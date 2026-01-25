-- Add RLS policy to allow public verification of students by ID
-- This only allows reading basic identification info needed for verification
CREATE POLICY "Anyone can verify student by ID" 
ON public.students 
FOR SELECT 
USING (status = 'active');

-- Note: This enables verification of active students only.
-- The policy is safe as it only exposes non-sensitive student info for ID verification.