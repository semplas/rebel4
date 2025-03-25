-- Create a function to execute arbitrary SQL
-- This is used by the migration script to run SQL commands
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;