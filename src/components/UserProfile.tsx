'use client';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>You need to be logged in to view this page.</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="glass-button mt-4"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <div className="mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
      </div>
      <button 
        onClick={handleSignOut}
        className="glass-button bg-red-500 text-white hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}