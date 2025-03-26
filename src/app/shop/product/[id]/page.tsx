import { Suspense } from 'react';
import { generateStaticParams } from './generateStaticParams';

// Export the generateStaticParams function
export { generateStaticParams };

// Component that uses client hooks
function ProductDetailClient() {
  // Import client components and hooks here
  // ...
  return (
    <div>
      {/* Product detail content */}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-20 flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold">Loading product...</div>
      </div>
    }>
      <ProductDetailClient />
    </Suspense>
  );
}
