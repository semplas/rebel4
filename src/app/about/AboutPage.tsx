'use client';

import { useSearchParams } from 'next/navigation';

export default function AboutPage() {
  const searchParams = useSearchParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">About Page</h1>
      <p className="mb-4">
        This is the about page of our application. We're using the latest Next.js patterns
        for handling client-side components in a static export.
      </p>
      {/* Additional about page content */}
    </div>
  );
}