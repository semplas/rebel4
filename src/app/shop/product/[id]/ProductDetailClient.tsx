'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProductDetailClient() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Debug state
  const [debug, setDebug] = useState({
    params: null,
    supabaseConfig: { url: supabaseUrl, key: supabaseAnonKey ? 'Set' : 'Not set' },
    fetchAttempted: false
  });

  useEffect(() => {
    // Update debug info
    setDebug(prev => ({
      ...prev,
      params: params
    }));
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setDebug(prev => ({ ...prev, fetchAttempted: true }));
        
        // Log the ID we're trying to fetch
        console.log('Fetching product with ID:', params.id);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Product data received:', data);
        
        if (!data) {
          throw new Error('Product not found');
        }
        
        // Format product to match expected structure
        const formattedProduct = {
          id: data.id,
          name: data.name,
          price: data.price || 0,
          image: data.image || '/images/1.png',
          images: Array.isArray(data.images) ? data.images : [data.image || '/images/1.png'],
          category: data.category || 'Uncategorized',
          color: data.color || '',
          isNew: data.is_new || false,
          description: data.description || '',
          features: data.features || []
        };
        
        console.log('Formatted product:', formattedProduct);
        setProduct(formattedProduct);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Render debug info in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Debug info:', debug);
    console.log('Product state:', product);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }

  if (loading) {
    return (
      <div className="py-8 container mx-auto px-4">
        <div className="mb-4">
          <Link href="/shop" className="text-sm uppercase tracking-wider font-medium hover:underline">
            ← Back to Shop
          </Link>
        </div>
        <div className="flex justify-center items-center h-96">
          <svg className="animate-spin h-12 w-12 text-accent-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 container mx-auto px-4">
        <div className="mb-4">
          <Link href="/shop" className="text-sm uppercase tracking-wider font-medium hover:underline">
            ← Back to Shop
          </Link>
        </div>
        <div className="glass p-8 text-center rounded-lg">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <p className="text-gray-600 mb-4">Unable to load product details.</p>
          <div className="flex justify-center">
            <Link href="/shop" className="glass-button px-6 py-2 rounded-lg">
              Return to Shop
            </Link>
          </div>
        </div>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
              {JSON.stringify({debug, params, supabaseConfig: debug.supabaseConfig}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-8 container mx-auto px-4">
        <div className="mb-4">
          <Link href="/shop" className="text-sm uppercase tracking-wider font-medium hover:underline">
            ← Back to Shop
          </Link>
        </div>
        <div className="glass p-8 text-center rounded-lg">
          <p className="text-gray-600 mb-4">Product not found.</p>
          <div className="flex justify-center">
            <Link href="/shop" className="glass-button px-6 py-2 rounded-lg">
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 container mx-auto px-4">
      <div className="mb-4">
        <Link href="/shop" className="text-sm uppercase tracking-wider font-medium hover:underline">
          ← Back to Shop
        </Link>
      </div>
      
      <div className="glass p-6 md:p-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative h-80 md:h-96 bg-white rounded-lg overflow-hidden mb-4">
              <Image 
                src={Array.isArray(product.images) && product.images.length > 0 && selectedImage < product.images.length 
                  ? product.images[selectedImage] 
                  : product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images && Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <div 
                    key={index}
                    className={`relative h-20 bg-white rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-accent-color' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image 
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-color mb-2">{product.name}</h1>
            <p className="text-accent-color text-xl md:text-2xl font-bold mb-4">£{product.price}</p>
            
            {product.category && (
              <div className="mb-4">
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
            )}
            
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Quantity</h3>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center border-y border-gray-200"
                />
                <button 
                  className="w-10 h-10 rounded-r-lg bg-gray-100 flex items-center justify-center"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Buy Now Button - Full width now that Add to Cart is removed */}
            <button className="w-full bg-accent-color text-white py-3 rounded-lg text-lg font-bold hover:bg-accent-color/90 transition-colors">
              Buy Now
            </button>
          </div>
        </div>
        
        {/* Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Debug info in development - Removed */}
      {/* {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
            {JSON.stringify({
              params,
              supabaseConfig: debug.supabaseConfig,
              product
            }, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
