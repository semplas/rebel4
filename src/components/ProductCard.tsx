'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingOverlay from './LoadingOverlay';

export default function ProductCard({ product, isWishlisted, onWishlistToggle }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  
  const handleProductClick = (e) => {
    // Only handle clicks on the card itself, not on buttons inside it
    if (e.target.closest('button')) return;
    
    setIsLoading(true);
    
    // Ensure the product ID is properly formatted for the URL
    const productId = product.id.toString();
    router.push(`/shop/product/${productId}`);
  };
  
  return (
    <div className="group relative">
      {isLoading && <LoadingOverlay isLoading={isLoading} />}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        onClick={handleProductClick}
      >
        <div className="relative h-64 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={product.image || "/images/1.png"}
            alt={product.name}
            width={500}
            height={500}
            className={`h-full w-full object-cover object-center lg:h-full lg:w-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/1.png";
              setImageLoaded(true);
            }}
            priority={false}
            loading="lazy"
          />
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-accent-color text-black text-xs font-bold px-3 py-1 rounded-full">
              NEW
            </div>
          )}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.location.href = `/shop/product/${product.id}`;
            }}
            className="absolute bottom-2 right-2 p-2 bg-black/70 text-white rounded-full hover:bg-accent-color hover:text-black transition-all duration-300"
            aria-label="Quick view"
            whileHover={{ 
              scale: 1.1,
              backgroundColor: 'var(--accent-color)',
              color: 'black'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              whileHover={{ 
                rotate: [0, -5, 5, -5, 5, 0],
                transition: { 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="w-5 h-5"
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" 
                />
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    transition: { 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }
                  }}
                />
              </svg>
            </motion.div>
          </motion.button>

          {/* Add a subtle tooltip */}
          <div className="absolute bottom-14 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/80 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
              Quick view
            </div>
            <div className="w-2 h-2 bg-black/80 transform rotate-45 absolute -bottom-1 right-4"></div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-accent-color font-bold mb-2">${product.price.toFixed(2)}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{product.category}</div>
            <div className="text-sm text-gray-600">
              {product.rating && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {product.rating}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
