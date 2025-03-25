'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function AboutPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>About Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPageContent />
    </Suspense>
  );
}
