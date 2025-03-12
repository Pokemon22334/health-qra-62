
-- Create public_qr_codes table
CREATE TABLE public.public_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.public_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public_qr_codes
CREATE POLICY "Users can view their own public QR codes" 
  ON public.public_qr_codes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own public QR codes" 
  ON public.public_qr_codes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own public QR codes" 
  ON public.public_qr_codes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own public QR codes" 
  ON public.public_qr_codes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create public_medical_records table to track records shared via public QR
CREATE TABLE public.public_medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID REFERENCES public.public_qr_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_id UUID REFERENCES public.health_records(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.public_medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public_medical_records
CREATE POLICY "Users can view their own public medical records" 
  ON public.public_medical_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own public medical records" 
  ON public.public_medical_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own public medical records" 
  ON public.public_medical_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a policy to allow public access to records via QR code
CREATE POLICY "Anyone can view public medical records" 
  ON public.health_records FOR SELECT 
  USING (
    id IN (
      SELECT record_id FROM public.public_medical_records
      JOIN public.public_qr_codes ON public_medical_records.qr_id = public_qr_codes.id
      WHERE public_qr_codes.is_active = true
      AND (public_qr_codes.expires_at IS NULL OR public_qr_codes.expires_at > now())
    )
  );
