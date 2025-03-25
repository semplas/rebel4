'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function RegisterPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Register Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
