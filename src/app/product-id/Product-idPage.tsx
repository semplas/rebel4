'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Component that uses client hooks
function IdPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Product Details</h1>
    </div>
  );
}

// Main page component with Suspense
export default function Product-idPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IdPageContent />
    </Suspense>
  );
}