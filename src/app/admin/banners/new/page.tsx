'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function NewPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>New Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function NewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPageContent />
    </Suspense>
  );
}
