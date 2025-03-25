-- Create a new migration file to fix the recursive policies

-- First, disable RLS temporarily to allow us to fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a special admin_access function that doesn't trigger recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id uuid)
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  -- Direct query to bypass RLS
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Use the security definer function for admin access
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Add admin update policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" 
    ON profiles FOR UPDATE 
    USING (is_admin_user(auth.uid()));
  END IF;
END
$$;

-- Add admin insert policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Admins can insert profiles'
  ) THEN
    CREATE POLICY "Admins can insert profiles" 
    ON profiles FOR INSERT 
    WITH CHECK (is_admin_user(auth.uid()) OR auth.uid() = id);
  END IF;
END
$$;
