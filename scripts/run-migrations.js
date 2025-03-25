// This script helps run Supabase migrations
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_PASSWORD'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease add them to your .env file');
  process.exit(1);
}

// Run migrations directly using the Supabase REST API
console.log('Running Supabase migrations...');

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
  
  // Execute each migration file using direct SQL queries
  migrationFiles.forEach(file => {
    const filePath = path.join(migrationsDir, file);
    console.log(`Running migration: ${file}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Use curl to execute SQL directly against the Supabase REST API
    const command = `curl -X POST "${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
      -H "apikey: ${process.env.SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"query": ${JSON.stringify(sql)}}'`;
    
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Successfully ran migration: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to run migration: ${file}`);
      console.error(error.message);
      process.exit(1);
    }
  });

  console.log('✅ All migrations completed successfully');
} catch (error) {
  console.error('❌ Failed to run migrations:');
  console.error(error.message);
  process.exit(1);
}
