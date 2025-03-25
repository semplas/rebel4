'use client';

import { Suspense } from 'react';

// Component that uses client hooks
function ProfilePageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Profile Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
