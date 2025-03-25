import { supabase } from '@/lib/supabase';

// User type definition
export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

// Sign up a new user
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

// Sign out the current user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

// Get the current session
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error('Get session failed:', error);
    throw error;
  }
}

// Get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error('Get user failed:', error);
    throw error;
  }
}

// Test the Supabase auth connection
export async function testAuthConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth connection test failed:', error);
      return false;
    }
    
    console.log('Auth connection test successful');
    return true;
  } catch (error) {
    console.error('Auth connection test threw an exception:', error);
    return false;
  }
}