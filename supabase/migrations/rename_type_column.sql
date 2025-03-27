-- Rename 'type' column to 'product_type' for better naming consistency
-- Only perform the rename if 'type' exists and 'product_type' doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'product_type'
  ) THEN
    ALTER TABLE products RENAME COLUMN type TO product_type;
  END IF;
END
$$;

-- If 'type' still exists and 'product_type' also exists, drop the 'type' column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'type'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'product_type'
  ) THEN
    ALTER TABLE products DROP COLUMN type;
  END IF;
END
$$;

-- Ensure product_type has a default value
ALTER TABLE products 
ALTER COLUMN product_type SET DEFAULT 'shoe';
