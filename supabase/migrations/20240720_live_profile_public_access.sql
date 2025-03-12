
-- Allow public access to user_permanent_qr
CREATE POLICY "Allow public access to user_permanent_qr" 
  ON public.user_permanent_qr 
  FOR SELECT 
  USING (true);

-- Update policy to allow public access to profiles for users with active permanent QRs
CREATE POLICY "Allow public access to profiles via permanent QR" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id IN (
      SELECT user_id FROM public.user_permanent_qr WHERE active = true
    )
  );

-- Allow public access to health_records for users with active permanent QRs
CREATE POLICY "Allow public access to health_records via permanent QR" 
  ON public.health_records 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT user_id FROM public.user_permanent_qr WHERE active = true
    )
  );

-- Allow public access to medications for users with active permanent QRs
CREATE POLICY "Allow public access to medications via permanent QR" 
  ON public.medications 
  FOR SELECT 
  USING (
    user_id IN (
      SELECT user_id FROM public.user_permanent_qr WHERE active = true
    )
  );
