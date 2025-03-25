'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import RegisterPageContent from './RegisterPageContent';

// Main page component with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading register page...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}