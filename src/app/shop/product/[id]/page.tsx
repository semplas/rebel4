import { generateStaticParams } from './generateStaticParams';
import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { createClient } from '@supabase/supabase-js';

// Define generateStaticParams directly in the page file
export async function generateStaticParams() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fetch all product IDs from the database
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      // Fallback to some default IDs in case of error
      return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
      ];
    }
    
    // Map products to the format expected by generateStaticParams
    return products.map(product => ({
      id: product.id.toString()
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    // Fallback to some default IDs in case of error
    return [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '40e1f01f-c321-45b5-8e36-638c6f7e34f9' }
    ];
  }
}

// Remove this duplicate export
// export { generateStaticParams };

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
