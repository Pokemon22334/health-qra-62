
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('blood_test', 'xray_mri', 'prescription', 'doctor_note', 'other')),
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create health_records policies
CREATE POLICY "Users can view their own records" 
  ON public.health_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" 
  ON public.health_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" 
  ON public.health_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" 
  ON public.health_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Create qr_codes table
CREATE TABLE public.qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.health_records(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create qr_codes policies
CREATE POLICY "Users can view their own QR codes" 
  ON public.qr_codes FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert QR codes for their records" 
  ON public.qr_codes FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own QR codes" 
  ON public.qr_codes FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create qr_code_access table to track who accessed what QR code
CREATE TABLE public.qr_code_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE NOT NULL,
  accessed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.qr_code_access ENABLE ROW LEVEL SECURITY;

-- Create qr_code_access policies
CREATE POLICY "Users can view accesses to their QR codes" 
  ON public.qr_code_access FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.qr_codes qc
    WHERE qc.id = qr_code_id AND qc.created_by = auth.uid()
  ));

-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical_records', 'Medical Records', false);

-- Create storage policy for authenticated users
CREATE POLICY "Authenticated users can upload medical records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical_records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical records"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical_records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medical records"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medical_records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medical records"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical_records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'User'), new.email, 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
