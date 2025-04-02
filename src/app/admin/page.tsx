'use client';

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import AdminContent from '@/components/admin/AdminContent';

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// Main page component with Suspense boundary
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading admin page...</div>}>
      <AdminContent />
    </Suspense>
  );
}
