'use client';

import { useSearchParams } from 'next/navigation';
import '../styles/Shop.css'; // Import any page-specific CSS
import { motion } from 'framer-motion'; // If you're using animation libraries

function AppPageContent() {
  const searchParams = useSearchParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 amazon-heading">Welcome to Awaknd Rebel</h1>
        <div className="glass-card p-6 mb-8">
          <p className="mb-4">Premium footwear handcrafted with quality materials</p>
          <a href="/shop" className="glass-button inline-block">Shop Now</a>
        </div>
        
        {/* Featured products section */}
        <section className="my-12">
          <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product cards would go here */}
          </div>
        </section>
      </motion.div>
    </div>
  );
}

export default function AppPage() {
  return <AppPageContent />;
}
