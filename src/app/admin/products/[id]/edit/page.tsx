'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function EditPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Edit Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPageContent />
    </Suspense>
  );
}
