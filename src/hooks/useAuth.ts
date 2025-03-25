'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    // For development, you can use this to simulate a logged-in user
    const useMockUser = process.env.NODE_ENV === 'development';
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          const userMetadata = session.user.user_metadata;
          console.log('Initial auth check - User metadata:', userMetadata);
  
          // Directly check for is_admin in metadata
          const isUserAdmin = userMetadata?.is_admin === true;
          console.log('Initial auth check - isAdmin value:', isUserAdmin);
  
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        // Only set loading to false after isAdmin is set
        setLoading(false);
      }
    };
  
    // Get initial session
    getInitialSession();
    
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check if user is admin
          if (session?.user) {
            const userMetadata = session.user.user_metadata;
            const isUserAdmin = userMetadata?.is_admin === true;
            
            // For debugging
            console.log('Auth state change - User:', session.user.email);
            console.log('Auth state change - Metadata:', userMetadata);
            console.log('Auth state change - isAdmin:', isUserAdmin);
            
            setIsAdmin(isUserAdmin);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );
  
      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth subscription error:', error);
      return () => {};
    }
  }, []);

  return { user, session, loading, isAdmin };
}