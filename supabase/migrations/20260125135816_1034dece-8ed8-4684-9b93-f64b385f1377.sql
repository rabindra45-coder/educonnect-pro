-- Create fee types enum
CREATE TYPE public.fee_type AS ENUM ('admission', 'tuition', 'exam', 'library', 'sports', 'computer', 'transport', 'uniform', 'other');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'partial', 'overdue', 'cancelled', 'refunded');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('cash', 'esewa', 'khalti', 'imepay', 'bank_transfer', 'cheque');

-- Fee structure table (class-wise fee configuration)
CREATE TABLE public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL,
  fee_type fee_type NOT NULL,
  amount numeric(10,2) NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  academic_year text NOT NULL,
  description text,
  due_day integer DEFAULT 10,
  late_fee_percentage numeric(5,2) DEFAULT 5.00,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class, fee_type, academic_year, frequency)
);

-- Student fee assignments (what each student owes)
CREATE TABLE public.student_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  month_year text, -- e.g., '2081-01' for monthly fees
  late_fee numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  discount_reason text,
  total_amount numeric(10,2) GENERATED ALWAYS AS (amount + late_fee - discount) STORED,
  paid_amount numeric(10,2) DEFAULT 0,
  balance numeric(10,2) GENERATED ALWAYS AS (amount + late_fee - discount - COALESCE(paid_amount, 0)) STORED,
  status payment_status DEFAULT 'pending',
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Fee payments table (payment transactions)
CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id uuid REFERENCES public.student_fees(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id text,
  gateway_response jsonb,
  receipt_number text UNIQUE,
  paid_at timestamptz NOT NULL DEFAULT now(),
  received_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payment gateway transactions (for tracking online payments)
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id uuid REFERENCES public.student_fees(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  gateway text NOT NULL CHECK (gateway IN ('esewa', 'khalti', 'imepay')),
  gateway_transaction_id text,
  gateway_reference text,
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'success', 'failed', 'refunded')),
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create sequence for receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('receipt_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating receipt numbers
CREATE TRIGGER generate_receipt_number_trigger
  BEFORE INSERT ON public.fee_payments
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION public.generate_receipt_number();

-- Function to update student fee status after payment
CREATE OR REPLACE FUNCTION public.update_fee_status_after_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_paid numeric;
  fee_total numeric;
BEGIN
  -- Calculate total paid for this student fee
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM fee_payments
  WHERE student_fee_id = NEW.student_fee_id;

  -- Get fee total
  SELECT total_amount INTO fee_total
  FROM student_fees
  WHERE id = NEW.student_fee_id;

  -- Update student fee
  UPDATE student_fees
  SET 
    paid_amount = total_paid,
    status = CASE
      WHEN total_paid >= fee_total THEN 'paid'::payment_status
      WHEN total_paid > 0 THEN 'partial'::payment_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.student_fee_id;

  RETURN NEW;
END;
$$;

-- Trigger to update fee status after payment
CREATE TRIGGER update_fee_status_trigger
  AFTER INSERT ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fee_status_after_payment();

-- Enable RLS on all tables
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Fee structures policies
CREATE POLICY "Admins can manage fee structures" ON public.fee_structures
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Anyone can view active fee structures" ON public.fee_structures
  FOR SELECT USING (is_active = true);

-- Student fees policies
CREATE POLICY "Admins can manage student fees" ON public.student_fees
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own fees" ON public.student_fees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_fees.student_id AND s.user_id = auth.uid()
    )
  );

-- Fee payments policies
CREATE POLICY "Admins can manage fee payments" ON public.fee_payments
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own payments" ON public.fee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = fee_payments.student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own payments" ON public.fee_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = fee_payments.student_id AND s.user_id = auth.uid()
    )
  );

-- Payment transactions policies
CREATE POLICY "Admins can manage payment transactions" ON public.payment_transactions
  FOR ALL USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Students can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = payment_transactions.student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = payment_transactions.student_id AND s.user_id = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at
  BEFORE UPDATE ON public.student_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();