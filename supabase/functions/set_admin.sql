-- Function to set a user as admin
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_admin = TRUE
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT set_user_as_admin('your-email@example.com');