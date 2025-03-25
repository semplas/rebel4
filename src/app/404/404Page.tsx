'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Component that uses client hooks
function 404PageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>404 Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function 404Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <404PageContent />
    </Suspense>
  );
}