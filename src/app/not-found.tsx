'use client';

import { Suspense } from 'react';

// Component that uses useSearchParams
function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">The page you are looking for does not exist or has been moved.</p>
      <a 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </a>
    </div>
  );
}

// Main page component with Suspense
export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
