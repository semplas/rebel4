'use client';

import { useState, useEffect } from 'react';
import { testAuthConnection, signIn, signUp, signOut, getCurrentUser } from '@/lib/auth';
import { isSupabaseConnected } from '@/lib/supabase';

export default function AuthTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('testing');
      const isConnected = await testAuthConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      // Try to get current user
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    
    checkConnection();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const result = await signUp(email, password);
      setMessage(`Sign up successful! Check your email for confirmation.`);
      console.log('Sign up result:', result);
    } catch (error: any) {
      setMessage(`Sign up failed: ${error.message}`);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const result = await signIn(email, password);
      setCurrentUser(result.user);
      setMessage('Sign in successful!');
    } catch (error: any) {
      setMessage(`Sign in failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    setMessage('');
    
    try {
      await signOut();
      setCurrentUser(null);
      setMessage('Sign out successful!');
    } catch (error: any) {
      setMessage(`Sign out failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto glass-card">
      <h2 className="text-2xl font-bold mb-4">Auth Connection Test</h2>
      
      <div className="mb-4">
        <p>Supabase Connection: {isSupabaseConnected() ? 'Using Real Client' : 'Using Mock Client'}</p>
        <p>Auth Status: {
          connectionStatus === 'testing' ? 'Testing connection...' :
          connectionStatus === 'connected' ? 'Connected to Supabase Auth' :
          'Failed to connect to Supabase Auth'
        }</p>
      </div>
      
      {currentUser ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Current User</h3>
          <p>ID: {currentUser.id}</p>
          <p>Email: {currentUser.email}</p>
          <button 
            onClick={handleSignOut}
            className="mt-2 px-4 py-2 bg-black text-white"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300"
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSignIn}
              className="px-4 py-2 bg-black text-white"
            >
              Sign In
            </button>
            
            <button
              type="button"
              onClick={handleSignUp}
              className="px-4 py-2 border border-black"
            >
              Sign Up
            </button>
          </div>
        </form>
      )}
      
      {message && (
        <div className={`mt-4 p-3 ${message.includes('failed') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
    </div>
  );
}