'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function AdminPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Admin Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
