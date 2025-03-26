import React, { Suspense } from 'react';
import AdminContent from '@/components/admin/AdminContent';

// Main page component with Suspense boundary
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading admin page...</div>}>
      <AdminContent />
    </Suspense>
  );
}

// Export generateStaticParams to ensure this page is included in the static build
export function generateStaticParams() {
  return [];
}
