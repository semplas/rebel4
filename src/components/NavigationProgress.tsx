'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleStart = () => {
      clearTimeout(timeout);
      setIsLoading(true);
      
      // Force loading to end after 10 seconds max
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    };
    
    const handleComplete = () => {
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Small delay to ensure the progress bar is visible
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleStart);
    
    // Create a MutationObserver to detect DOM changes that might indicate page loading
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector('.loading-indicator-trigger')) {
        handleStart();
      } else {
        handleComplete();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      window.removeEventListener('beforeunload', handleStart);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);
  
  // Reset loading state when the route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <motion.div 
        className="h-1 bg-accent-color"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
