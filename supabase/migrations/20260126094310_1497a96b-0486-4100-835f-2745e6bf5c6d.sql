-- Allow super_admin and admin to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_any_admin_role(auth.uid()));

-- Allow super_admin and admin to manage all user roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_any_admin_role(auth.uid()));