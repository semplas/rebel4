'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CartIcon() {
  const [itemCount, setItemCount] = useState(0);
  
  return (
    <Link href="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
