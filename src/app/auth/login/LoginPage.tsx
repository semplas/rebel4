'use client';

import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      
      {/* Login form goes here */}
      <form className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input 
            type="password"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button 
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a></p>
      </div>
    </div>
  );
}