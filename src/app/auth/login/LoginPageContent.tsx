'use client';

import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <LoginForm redirectTo={redirectTo} />
      
      <div className="mt-4 text-center">
        <p>Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a></p>
      </div>
    </div>
  );
}