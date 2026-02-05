
-- Create a trigger function to auto-create teacher profile when teacher role is assigned
CREATE OR REPLACE FUNCTION public.handle_teacher_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Only process if role is 'teacher'
  IF NEW.role = 'teacher' THEN
    -- Get user info from profiles
    SELECT email, full_name INTO v_user_email, v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Check if teacher profile already exists for this user
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE user_id = NEW.user_id) THEN
      -- Create teacher profile
      INSERT INTO public.teachers (
        user_id,
        full_name,
        email,
        status
      ) VALUES (
        NEW.user_id,
        COALESCE(v_user_name, 'Teacher'),
        v_user_email,
        'active'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_teacher_role_assigned ON public.user_roles;

-- Create trigger for new teacher role assignments
CREATE TRIGGER on_teacher_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_teacher_role_assignment();

-- Also create similar trigger for accountant and librarian roles
CREATE OR REPLACE FUNCTION public.handle_staff_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user info from profiles
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Handle teacher role
  IF NEW.role = 'teacher' THEN
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.teachers (user_id, full_name, email, status)
      VALUES (NEW.user_id, COALESCE(v_user_name, 'Teacher'), v_user_email, 'active');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the trigger to use the comprehensive function
DROP TRIGGER IF EXISTS on_teacher_role_assigned ON public.user_roles;
CREATE TRIGGER on_staff_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_staff_role_assignment();
