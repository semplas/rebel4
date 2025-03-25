'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function ShopPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Shop Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
