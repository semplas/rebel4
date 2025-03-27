'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
=======
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setRegistrationSuccess(true);
    }
    
    // Safety timeout to prevent stuck loading state
    let loadingTimeout;
    if (loading) {
      loadingTimeout = setTimeout(() => {
        setLoading(false);
        setError('Request timed out. Please try again.');
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loading]);

=======
  const router = useRouter();
  const supabase = createClientComponentClient();

>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
<<<<<<< HEAD
      console.log('Attempting login with:', email);
=======
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
<<<<<<< HEAD
      console.log('Login successful, redirecting...');
      // Redirect to admin page on successful login
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
=======
      // Redirect to admin page on successful login
      router.push('/admin');
    } catch (err) {
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
<<<<<<< HEAD
        {registrationSuccess && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md text-center">
            Account created successfully! Please check your email to confirm your registration.
          </div>
        )}
=======
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-accent-color focus:border-accent-color focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-accent-color focus:border-accent-color focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-color hover:bg-accent-color-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-color"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
<<<<<<< HEAD
        <div className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-accent-color hover:text-accent-color-dark">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
=======
      </div>
    </div>
  );
}
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
