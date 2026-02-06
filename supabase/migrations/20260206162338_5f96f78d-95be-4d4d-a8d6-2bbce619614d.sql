
-- Fix 1: Update has_any_admin_role to include 'accountant'
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'teacher', 'staff', 'accountant')
  )
$$;

-- Fix 2: Add accountant SELECT policies for library_fines (currently only librarian + student)
CREATE POLICY "Accountants can view library fines"
  ON public.library_fines
  FOR SELECT
  USING (is_accountant(auth.uid()));

-- Fix 3: Create trigger to auto-update budget spent_amount when expenses change
CREATE OR REPLACE FUNCTION public.update_budget_spent_on_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT: add expense amount to matching budget
  IF TG_OP = 'INSERT' AND NEW.department IS NOT NULL THEN
    UPDATE public.budget_allocations
    SET spent_amount = spent_amount + NEW.amount,
        updated_at = now()
    WHERE department = NEW.department
      AND academic_year = COALESCE(NEW.academic_year, EXTRACT(YEAR FROM CURRENT_DATE)::text);
  END IF;

  -- On UPDATE: adjust the difference
  IF TG_OP = 'UPDATE' THEN
    -- Remove old amount from old department
    IF OLD.department IS NOT NULL THEN
      UPDATE public.budget_allocations
      SET spent_amount = GREATEST(spent_amount - OLD.amount, 0),
          updated_at = now()
      WHERE department = OLD.department
        AND academic_year = COALESCE(OLD.academic_year, EXTRACT(YEAR FROM CURRENT_DATE)::text);
    END IF;
    -- Add new amount to new department
    IF NEW.department IS NOT NULL THEN
      UPDATE public.budget_allocations
      SET spent_amount = spent_amount + NEW.amount,
          updated_at = now()
      WHERE department = NEW.department
        AND academic_year = COALESCE(NEW.academic_year, EXTRACT(YEAR FROM CURRENT_DATE)::text);
    END IF;
  END IF;

  -- On DELETE: subtract expense amount
  IF TG_OP = 'DELETE' AND OLD.department IS NOT NULL THEN
    UPDATE public.budget_allocations
    SET spent_amount = GREATEST(spent_amount - OLD.amount, 0),
        updated_at = now()
    WHERE department = OLD.department
      AND academic_year = COALESCE(OLD.academic_year, EXTRACT(YEAR FROM CURRENT_DATE)::text);
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_expense_change_update_budget
  AFTER INSERT OR UPDATE OR DELETE ON public.school_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_budget_spent_on_expense();

-- Fix 4: Recalculate existing budget spent_amounts from actual expenses
UPDATE public.budget_allocations ba
SET spent_amount = COALESCE(
  (SELECT SUM(se.amount) FROM public.school_expenses se 
   WHERE se.department = ba.department AND se.academic_year = ba.academic_year),
  0
);
