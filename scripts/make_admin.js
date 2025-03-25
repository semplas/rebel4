// Run this script with: node scripts/make_admin.js your-email@example.com
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This is different from the anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin(email) {
  try {
    console.log(`Attempting to make ${email} an admin...`);
    
    // First, check if the user exists in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    if (!userData || !userData.user) {
      console.error('User not found with email:', email);
      return;
    }
    
    const userId = userData.user.id;
    console.log(`Found user with ID: ${userId}`);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      console.error('Error checking profile:', profileError);
      
      // If profiles table doesn't exist, create it
      if (profileError.code === '42P01') { // PostgreSQL code for undefined_table
        console.log('Profiles table does not exist. Please run the check_profiles_table.js script first.');
        return;
      }
    }
    
    if (!profile) {
      console.log('Profile not found, creating one...');
      
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: userId, 
            email: email,
            is_admin: true 
          }
        ]);
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return;
      }
      
      console.log(`Created profile for ${email} with admin privileges`);
    } else {
      console.log('Profile found, updating admin status...');
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }
      
      console.log(`Updated profile for ${email} with admin privileges`);
    }
    
    console.log(`User ${email} is now an admin!`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

makeAdmin(email);
