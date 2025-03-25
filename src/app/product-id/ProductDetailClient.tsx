'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Product } from '@/types/product';
import BrandLoader from '@/components/BrandLoader';
import LoadingButton from '@/components/LoadingButton';
import { createCheckoutSession } from '@/lib/stripe';

export default function ProductDetailClient({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Set the initial image when product loads
  useEffect(() => {
    try {
      if (!product) {
        setError('Product data is missing');
        setIsLoading(false);
        return;
      }
      
      // Ensure product has images array
      const images = product.images || [];
      const image = product.image || '';
      
      if (images.length > 0) {
        setCurrentImage(images[0]);
      } else if (image) {
        setCurrentImage(image);
      } else {
        setCurrentImage('/images/1.png');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error setting initial image:', err);
      setError('Failed to load product image');
      setCurrentImage('/images/1.png');
      setIsLoading(false);
    }
  }, [product]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <BrandLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  // Ensure price is a number for display
  const price = typeof product.price === 'number' ? product.price : 
                typeof product.price === 'string' ? parseFloat(product.price) : 0;

  // Handle image selection
  const handleImageSelect = (image: string, index: number) => {
    setCurrentImage(image);
    setSelectedImageIndex(index);
  };

  // Handle buy now click
  const handleBuyNow = async () => {
    setIsCheckingOut(true);
    try {
      // Existing checkout logic
      setIsCheckingOut(false);
    } catch (err) {
      console.error('Checkout error:', err);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-[var(--light-bg)]">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span className="hover:text-[var(--accent-secondary)] cursor-pointer">Home</span> &gt; 
        <span className="hover:text-[var(--accent-secondary)] cursor-pointer"> Shop</span> &gt; 
        <span className="hover:text-[var(--accent-secondary)] cursor-pointer"> {product.category || "Products"}</span> &gt; 
        <span className="text-gray-700"> {product.name}</span>
      </div>

      <div className="bg-white p-6 rounded shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images Section */}
          <div className="md:w-2/5">
            <div className="border border-gray-200 p-2 h-full flex flex-col">
              {/* Main Image */}
              <motion.div 
                className="relative w-full h-[400px] mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src={currentImage || "/images/1.png"}
                  alt={product.name || "Product"}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/1.png";
                  }}
                />
              </motion.div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative w-16 h-16 flex-shrink-0 cursor-pointer border-2 ${
                        selectedImageIndex === index ? 'border-[var(--accent-color)]' : 'border-gray-200'
                      }`}
                      onClick={() => handleImageSelect(image, index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - view ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/1.png";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="md:w-3/5">
            <h1 className="text-2xl font-bold mb-1">{product.name || "Unnamed Product"}</h1>
            
            {/* Ratings */}
            <div className="flex items-center mb-2">
              <div className="flex text-[var(--accent-color)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-blue-600 ml-2 hover:text-[var(--accent-secondary)] cursor-pointer">
                (42 customer reviews)
              </span>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              <span className="text-sm">Price:</span>
              <p className="text-2xl font-semibold text-[var(--success-green)]">${price.toFixed(2)}</p>
              {price > 25 && (
                <p className="text-sm text-[var(--success-green)]">
                  FREE delivery <span className="font-bold">Tomorrow</span> if you order within 
                  <span className="font-bold"> 3 hrs 45 mins</span>
                </p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium mb-2">About this item</h3>
              <p className="text-gray-700">{product.description || "No description available"}</p>
            </div>
            
            {/* In Stock */}
            <p className="text-[var(--success-green)] font-medium mb-4">In Stock</p>
            
            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Quantity:</label>
              <div className="inline-flex border border-gray-300 rounded">
                <button 
                  className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 border-gray-300">{quantity}</span>
                <button 
                  className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mb-6">
              <button 
                className="amazon-button py-2 px-4 rounded text-center w-full"
                onClick={handleBuyNow}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? <LoadingButton /> : "Buy Now"}
              </button>
              
            </div>
            
            {/* Secure Transaction */}
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure transaction
            </div>
            
            {/* Ships From */}
            <div className="text-sm text-gray-700">
              <p><span className="text-gray-500">Ships from</span> Awaknd Rebel</p>
              <p><span className="text-gray-500">Sold by</span> Awaknd Rebel</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-8 bg-white p-6 rounded shadow-sm">
        <div className="border-b border-gray-200 mb-4">
          <div className="flex flex-wrap -mb-px">
            <button className="inline-block py-2 px-4 text-[var(--accent-secondary)] border-b-2 border-[var(--accent-secondary)] font-medium">
              Product Details
            </button>
            <button className="inline-block py-2 px-4 text-gray-500 hover:text-gray-700 font-medium">
              Customer Reviews
            </button>
            <button className="inline-block py-2 px-4 text-gray-500 hover:text-gray-700 font-medium">
              Q&A
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-500 w-1/3">Brand</td>
                  <td className="py-2">{product.brand || "Generic"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-500">Category</td>
                  <td className="py-2">{product.category || "Uncategorized"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-500">Weight</td>
                  <td className="py-2">{product.weight || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2 text-gray-500">Dimensions</td>
                  <td className="py-2">{product.dimensions || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Features</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Premium quality materials</li>
              <li>Designed for durability and performance</li>
              <li>Easy to use and maintain</li>
              <li>Backed by our satisfaction guarantee</li>
              <li>Compatible with most standard accessories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
