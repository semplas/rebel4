import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a singleton Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize supabase client with optimized settings
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase.auth.token',
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    // Add request timeout to prevent hanging requests
    fetch: (url, options) => {
      const timeout = 8000; // 8 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    }
  },
  db: {
    schema: 'public'
  }
});

export { supabase };

// Helper function to check connection
export function isSupabaseConnected() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
