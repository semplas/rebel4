'use client';

import { useSearchParams } from 'next/navigation';
import '../../styles/Shop.css'; // Import shop-specific styles

export default function ShopPage() {
  const searchParams = useSearchParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 amazon-heading">Shop Our Collection</h1>
      
      {/* Filters */}
      <div className="glass-card p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select className="w-full p-2 border rounded">
              <option value="">All Categories</option>
              <option value="sneakers">Sneakers</option>
              <option value="boots">Boots</option>
              <option value="sandals">Sandals</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select className="w-full p-2 border rounded">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Product cards would go here */}
      </div>
      
      {/* Pagination */}
      <div className="pagination mt-12">
        <button className="pagination-button" disabled>Previous</button>
        <div className="pagination-numbers">
          <div className="pagination-number active">1</div>
          <div className="pagination-number">2</div>
          <div className="pagination-number">3</div>
        </div>
        <button className="pagination-button">Next</button>
      </div>
    </div>
  );
}
