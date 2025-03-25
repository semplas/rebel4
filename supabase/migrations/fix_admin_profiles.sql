-- Ensure the profiles table has the right structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update RLS policies to allow admin operations
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create admin policies
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create a function to set a user as admin
CREATE OR REPLACE FUNCTION make_user_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;