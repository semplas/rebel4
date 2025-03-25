-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create more permissive policies for products
CREATE POLICY "Anyone can read products" 
ON products FOR SELECT 
USING (true);

-- Use a more direct approach for admin checks
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