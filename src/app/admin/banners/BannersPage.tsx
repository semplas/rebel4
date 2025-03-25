'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

// Component that uses client hooks
function BannersPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Banners Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function BannersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BannersPageContent />
    </Suspense>
  );
}