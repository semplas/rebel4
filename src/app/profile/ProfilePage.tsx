'use client';

import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
      {/* Profile page content */}
    </div>
  );
}