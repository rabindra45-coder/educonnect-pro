
-- Create table for payment QR codes/scanners uploaded by admin
CREATE TABLE public.payment_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway VARCHAR(50) NOT NULL, -- esewa, khalti, imepay, bank_transfer
  gateway_name VARCHAR(100) NOT NULL, -- Display name
  qr_image_url TEXT NOT NULL,
  account_name VARCHAR(200),
  account_number VARCHAR(100),
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for payment verification requests from students
CREATE TABLE public.payment_verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_fee_id UUID NOT NULL REFERENCES student_fees(id),
  student_id UUID NOT NULL REFERENCES students(id),
  gateway VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  transaction_id VARCHAR(200),
  screenshot_url TEXT,
  remarks TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_qr_codes
CREATE POLICY "Anyone can view active QR codes" ON public.payment_qr_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage QR codes" ON public.payment_qr_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'accountant'))
  );

-- RLS Policies for payment_verification_requests
CREATE POLICY "Students can view own payment requests" ON public.payment_verification_requests
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can create payment requests" ON public.payment_verification_requests
  FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all payment requests" ON public.payment_verification_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'accountant'))
  );

CREATE POLICY "Admins can update payment requests" ON public.payment_verification_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'accountant'))
  );

-- Create indexes
CREATE INDEX idx_payment_qr_codes_active ON payment_qr_codes(is_active, display_order);
CREATE INDEX idx_payment_verification_status ON payment_verification_requests(status);
CREATE INDEX idx_payment_verification_student ON payment_verification_requests(student_id);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment proofs
CREATE POLICY "Anyone can view payment proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
