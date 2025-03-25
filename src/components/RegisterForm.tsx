'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      console.log('Attempting registration with:', email);
      
      // Use the most basic signup approach possible
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Remove any options or metadata to simplify the request
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      console.log('Registration successful:', data);
      
      // Don't try to create a profile here - let the database trigger handle it
      // or handle it after email verification
      
      setMessage({ 
        text: 'Registration successful! Please check your email to confirm your account.', 
        type: 'success' 
      });
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (error: any) {
      console.error('Registration error details:', error);
      setMessage({ 
        text: error.message || 'Registration failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Create an Account</h2>
      
      {message && (
        <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label className="block mb-1">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
          minLength={6}
        />
      </div>
      
      <div>
        <label className="block mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
          minLength={6}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="glass-button w-full"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
