DELETE FROM public.user_roles ur
WHERE ur.role = 'parent'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.role = 'student'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.parents p WHERE p.user_id = ur.user_id
  );