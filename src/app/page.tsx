'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function AppPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>App Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function AppPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppPageContent />
    </Suspense>
  );
}
