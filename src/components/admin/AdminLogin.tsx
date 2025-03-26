
'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaLock } from 'react-icons/fa';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background-color">
      <div className="amazon-card p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <FaLock className="text-4xl text-accent-color" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          {/* Form fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-accent-color focus:border-accent-color"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-accent-color focus:border-accent-color"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-color text-black py-2 px-4 rounded hover:bg-[#F0AD4E] transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-accent-color hover:text-[#F0AD4E]">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

