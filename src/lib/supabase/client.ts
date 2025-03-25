import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Singleton pattern for Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  // Return existing client if already created
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
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
    }
  });
  
  return supabaseClient;
}
