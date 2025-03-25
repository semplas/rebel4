'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Component that uses client hooks
function LoginPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Login Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}