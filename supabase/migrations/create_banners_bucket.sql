-- Create banners storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own banners" ON storage.objects;

-- Create policies for the banners bucket
CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete own banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  auth.uid() = owner
);