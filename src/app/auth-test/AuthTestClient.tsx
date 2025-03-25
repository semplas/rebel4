'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { testAuthConnection, signIn, signUp, signOut, getCurrentUser } from '@/lib/auth';
import { isSupabaseConnected } from '@/lib/supabase';

export default function AuthTestClient() {
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed: ' + error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      alert('Check your email for the confirmation link');
    } catch (error) {
      console.error('Sign up error:', error);
      alert('Sign up failed: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const testConnection = async () => {
    const result = await testAuthConnection();
    alert(result ? 'Connection successful' : 'Connection failed');
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p>Supabase: <span className={connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>{connectionStatus}</span></p>
        <button 
          onClick={testConnection}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>

      {user ? (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          <button 
            onClick={handleSignOut}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <form className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUp}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}