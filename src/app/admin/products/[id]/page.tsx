'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function IdPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Id Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function IdPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IdPageContent />
    </Suspense>
  );
}
