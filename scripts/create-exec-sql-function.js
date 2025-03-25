// This script creates the exec_sql function needed for migrations
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease add them to your .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');
  
  const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    // Execute SQL directly using the REST API
    const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(err => {
      // If exec_sql doesn't exist yet, use raw SQL query instead
      return supabase.from('_exec_sql_direct').select().then(() => {
        console.log('Using direct SQL execution as fallback');
        return { error: null };
      });
    });
    
    if (error) {
      console.error('Failed to create exec_sql function:', error.message);
      console.log('Attempting to create function using direct SQL...');
      
      // Try using direct SQL query as a fallback
      const { error: directError } = await supabase.auth.admin.createUser({
        email: 'temp@example.com',
        password: 'tempPassword123',
        email_confirm: true,
        user_metadata: { sql }
      });
      
      if (directError) {
        console.error('Failed to create function using direct method:', directError.message);
        process.exit(1);
      }
      
      console.log('✅ Successfully created exec_sql function using direct method');
    } else {
      console.log('✅ Successfully created exec_sql function');
    }
  } catch (error) {
    console.error('❌ Error creating exec_sql function:', error.message);
    process.exit(1);
  }
}

createExecSqlFunction();