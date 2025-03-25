'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import BrandLoader from '@/components/BrandLoader';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data);
      
      // Add a small delay to ensure auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user is admin
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Error checking admin status');
      }

      // Check if we got any profiles and if the user is admin
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      console.log('Profile check result:', profile);

      if (!profile) {
        console.error('No profile found for user');
        
        // Create a profile with admin rights if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, email: data.user.email, is_admin: true }
          ]);
          
        if (insertError) {
          console.error('Error creating admin profile:', insertError);
          throw new Error('Failed to create admin profile');
        }
        
        console.log('Created new admin profile for user');
        toast.success('Login successful! Admin profile created.');
      } else if (!profile.is_admin) {
        console.error('User is not admin:', profile);
        
        // Update the profile to make the user an admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error('Error updating admin status:', updateError);
          throw new Error('Failed to update admin status');
        }
        
        console.log('Updated user to admin status');
        toast.success('Login successful! Admin status granted.');
      } else {
        toast.success('Login successful!');
      }
      
      // Redirect to admin page
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error details:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="w-full py-4">
          <BrandLoader />
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </>
  );
}
