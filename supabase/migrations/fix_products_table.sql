-- Update products table to ensure it has all required columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- Ensure column names match the TypeScript types (snake_case in DB, camelCase in code)
-- Only rename if the column exists and "isNew" doesn't exist yet
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'is_new'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'isNew'
  ) THEN
    ALTER TABLE products RENAME COLUMN is_new TO "isNew";
  END IF;
END
$$;

-- Update the RLS policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Anyone can read products" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update products" 
ON products FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete products" 
ON products FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
