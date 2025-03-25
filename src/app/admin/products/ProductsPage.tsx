'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Component that uses client hooks
function ProductsPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Products Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}