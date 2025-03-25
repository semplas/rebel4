// Run this script with: node scripts/check_profiles_table.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesTable() {
  try {
    // Check if profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking profiles table:', error);
      
      // If table doesn't exist, create it
      if (error.code === '42P01') { // PostgreSQL code for undefined_table
        console.log('Profiles table does not exist. Creating it...');
        
        // Create profiles table
        const { error: createError } = await supabase.rpc('create_profiles_table');
        
        if (createError) {
          console.error('Error creating profiles table:', createError);
        } else {
          console.log('Profiles table created successfully!');
        }
      }
      
      return;
    }
    
    console.log('Profiles table exists:', data);
    
    // Check if is_admin column exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return;
    }
    
    const hasIsAdmin = columns.some(col => col.column_name === 'is_admin');
    
    if (!hasIsAdmin) {
      console.log('is_admin column does not exist. Adding it...');
      
      // Add is_admin column
      const { error: alterError } = await supabase
        .rpc('add_is_admin_column');
      
      if (alterError) {
        console.error('Error adding is_admin column:', alterError);
      } else {
        console.log('is_admin column added successfully!');
      }
    } else {
      console.log('is_admin column exists');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkProfilesTable();