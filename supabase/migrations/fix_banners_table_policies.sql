-- Enable RLS on banners table
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;

-- Create policies for the banners table
CREATE POLICY "Anyone can view banners"
ON banners FOR SELECT
USING (true);

-- Add admin policy for managing banners
CREATE POLICY "Admins can manage banners"
ON banners FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);