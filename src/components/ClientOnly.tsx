'use client';

import { ReactNode, Suspense } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = <div>Loading...</div> }: ClientOnlyProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}