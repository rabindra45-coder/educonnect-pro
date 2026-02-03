-- Fix the generate_monthly_fees function (don't insert into generated columns)
CREATE OR REPLACE FUNCTION public.generate_monthly_fees(
  p_month INTEGER DEFAULT NULL,
  p_year INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_month INTEGER;
  v_year INTEGER;
  v_month_year TEXT;
  v_due_date DATE;
  v_student RECORD;
  v_fee_structure RECORD;
BEGIN
  v_month := COALESCE(p_month, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
  v_month_year := TO_CHAR(TO_DATE(v_month::TEXT || '-' || v_year::TEXT, 'MM-YYYY'), 'Month YYYY');
  
  FOR v_student IN 
    SELECT id, class FROM students WHERE status = 'active' OR status IS NULL
  LOOP
    FOR v_fee_structure IN 
      SELECT id, fee_type, amount, due_day, late_fee_percentage, frequency
      FROM fee_structures 
      WHERE class = v_student.class 
        AND is_active = true
        AND frequency = 'monthly'
    LOOP
      v_due_date := MAKE_DATE(v_year, v_month, COALESCE(v_fee_structure.due_day, 10));
      
      IF NOT EXISTS (
        SELECT 1 FROM student_fees 
        WHERE student_id = v_student.id 
          AND fee_structure_id = v_fee_structure.id
          AND month_year = v_month_year
      ) THEN
        -- Don't insert into generated columns (total_amount, balance)
        INSERT INTO student_fees (
          student_id,
          fee_structure_id,
          amount,
          due_date,
          month_year,
          late_fee,
          discount,
          paid_amount,
          status
        ) VALUES (
          v_student.id,
          v_fee_structure.id,
          v_fee_structure.amount,
          v_due_date,
          v_month_year,
          0,
          0,
          0,
          CASE 
            WHEN v_due_date < CURRENT_DATE THEN 'overdue'::payment_status
            ELSE 'pending'::payment_status
          END
        );
        
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Fix generate_one_time_fees function
CREATE OR REPLACE FUNCTION public.generate_one_time_fees(p_student_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_student RECORD;
  v_fee_structure RECORD;
  v_due_date DATE;
BEGIN
  SELECT id, class INTO v_student FROM students WHERE id = p_student_id;
  
  IF v_student IS NULL THEN
    RETURN 0;
  END IF;
  
  FOR v_fee_structure IN 
    SELECT id, fee_type, amount, due_day, frequency
    FROM fee_structures 
    WHERE class = v_student.class 
      AND is_active = true
      AND frequency = 'one_time'
  LOOP
    v_due_date := CURRENT_DATE + INTERVAL '15 days';
    
    IF NOT EXISTS (
      SELECT 1 FROM student_fees 
      WHERE student_id = v_student.id 
        AND fee_structure_id = v_fee_structure.id
    ) THEN
      INSERT INTO student_fees (
        student_id,
        fee_structure_id,
        amount,
        due_date,
        month_year,
        late_fee,
        discount,
        paid_amount,
        status
      ) VALUES (
        v_student.id,
        v_fee_structure.id,
        v_fee_structure.amount,
        v_due_date,
        NULL,
        0,
        0,
        0,
        'pending'::payment_status
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$;