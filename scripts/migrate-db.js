// This script runs migrations using the Supabase JavaScript client
require('dotenv').config();
console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (not showing for security)' : 'Not set');
const fs = require('fs');
const path = require('path');
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

// Create Supabase client with service role key (has full admin rights)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    // Get all SQL files from migrations folder
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.error('No migration files found in supabase/migrations');
      process.exit(1);
    }

    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running migration: ${file}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute SQL using the Supabase client
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        console.error(`❌ Failed to run migration: ${file}`);
        console.error(error.message);
        process.exit(1);
      }
      
      console.log(`✅ Successfully ran migration: ${file}`);
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Failed to run migrations:');
    console.error(error.message);
    process.exit(1);
  }
}

runMigrations();
