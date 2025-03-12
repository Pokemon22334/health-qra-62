
-- Create a policy to allow public access to emergency profiles without authentication
CREATE POLICY "Allow public emergency profile access" 
  ON public.emergency_profiles FOR SELECT 
  USING (true);

-- Create a policy to allow public access to emergency access logs for tracking purposes
CREATE POLICY "Allow public emergency access logging" 
  ON public.emergency_access_logs FOR INSERT 
  WITH CHECK (true);
