'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function Auth-testPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Auth-test Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function Auth-testPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Auth-testPageContent />
    </Suspense>
  );
}
