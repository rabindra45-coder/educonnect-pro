-- Create a function to assign fee structures to a student based on their class
CREATE OR REPLACE FUNCTION public.assign_fees_to_student()
RETURNS TRIGGER AS $$
DECLARE
  fee_record RECORD;
  current_month TEXT;
  due_date DATE;
BEGIN
  -- Get current month-year
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Loop through all active fee structures for the student's class
  FOR fee_record IN 
    SELECT * FROM public.fee_structures 
    WHERE class = NEW.class 
    AND is_active = true 
    AND academic_year = TO_CHAR(NOW(), 'YYYY')
  LOOP
    -- Calculate due date based on frequency
    IF fee_record.frequency = 'monthly' THEN
      due_date := DATE_TRUNC('month', NOW()) + (COALESCE(fee_record.due_day, 10) - 1) * INTERVAL '1 day';
    ELSIF fee_record.frequency = 'yearly' THEN
      due_date := DATE_TRUNC('year', NOW()) + INTERVAL '1 month' + (COALESCE(fee_record.due_day, 10) - 1) * INTERVAL '1 day';
    ELSE -- one_time fees
      due_date := CURRENT_DATE + INTERVAL '30 days';
    END IF;
    
    -- Insert the student fee record
    INSERT INTO public.student_fees (
      student_id,
      fee_structure_id,
      amount,
      due_date,
      total_amount,
      balance,
      month_year,
      status
    ) VALUES (
      NEW.id,
      fee_record.id,
      fee_record.amount,
      due_date,
      fee_record.amount,
      fee_record.amount,
      CASE WHEN fee_record.frequency = 'monthly' THEN current_month ELSE NULL END,
      'pending'
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicate entries
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-assign fees when a student is enrolled
DROP TRIGGER IF EXISTS on_student_enrollment_assign_fees ON public.students;
CREATE TRIGGER on_student_enrollment_assign_fees
AFTER INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.assign_fees_to_student();

-- Also create a function to generate monthly fees for all students
CREATE OR REPLACE FUNCTION public.generate_monthly_fees()
RETURNS void AS $$
DECLARE
  student_record RECORD;
  fee_record RECORD;
  current_month TEXT;
  due_date DATE;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Loop through all active students
  FOR student_record IN SELECT * FROM public.students WHERE status = 'active'
  LOOP
    -- Loop through monthly fee structures for the student's class
    FOR fee_record IN 
      SELECT * FROM public.fee_structures 
      WHERE class = student_record.class 
      AND is_active = true 
      AND frequency = 'monthly'
      AND academic_year = TO_CHAR(NOW(), 'YYYY')
    LOOP
      due_date := DATE_TRUNC('month', NOW()) + (COALESCE(fee_record.due_day, 10) - 1) * INTERVAL '1 day';
      
      -- Check if this fee already exists for this month
      IF NOT EXISTS (
        SELECT 1 FROM public.student_fees 
        WHERE student_id = student_record.id 
        AND fee_structure_id = fee_record.id 
        AND month_year = current_month
      ) THEN
        INSERT INTO public.student_fees (
          student_id,
          fee_structure_id,
          amount,
          due_date,
          total_amount,
          balance,
          month_year,
          status
        ) VALUES (
          student_record.id,
          fee_record.id,
          fee_record.amount,
          due_date,
          fee_record.amount,
          fee_record.amount,
          current_month,
          'pending'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;