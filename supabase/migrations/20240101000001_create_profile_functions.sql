-- Function to create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add is_admin column if it doesn't exist
CREATE OR REPLACE FUNCTION add_is_admin_column()
RETURNS void AS $$
BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text) AS $$
BEGIN
  RETURN QUERY
  SELECT c.column_name::text, c.data_type::text
  FROM information_schema.columns c
  WHERE c.table_name = table_name;
END;
$$ LANGUAGE plpgsql;
