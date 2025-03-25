'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { testAuthConnection, signIn, signUp, signOut, getCurrentUser } from '@/lib/auth';
import { isSupabaseConnected } from '@/lib/supabase';

export default function AuthTestContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check connection status
    const checkConnection = async () => {
      const connected = await isSupabaseConnected();
      setConnectionStatus(connected ? 'Connected' : 'Not connected');
    };
    
    // Check current user
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    checkConnection();
    checkUser();
  }, []);

  // Rest of your component logic...
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <p>Supabase: <span className={connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>{connectionStatus}</span></p>
        </div>

        {/* Rest of your component UI... */}
      </div>
    </div>
  );
}