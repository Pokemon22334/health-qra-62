
-- Create policy to allow public SELECT access to qr_codes
CREATE POLICY "Allow public access to qr_codes" 
  ON public.qr_codes 
  FOR SELECT 
  USING (
    is_revoked = false AND 
    (expires_at IS NULL OR expires_at > now())
  );

-- Update policy to allow public SELECT access to health_records via QR codes
CREATE POLICY "Allow public access to health_records via QR code" 
  ON public.health_records 
  FOR SELECT 
  USING (
    id IN (
      SELECT record_id FROM public.qr_codes 
      WHERE is_revoked = false 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Allow anonymous QR code access logging
CREATE POLICY "Allow public QR code access logging" 
  ON public.qr_code_access 
  FOR INSERT 
  WITH CHECK (true);
