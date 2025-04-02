'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navigation, Pagination as SwiperPagination, Autoplay } from 'swiper/modules';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    productType: '',
    color: '',
    isNew: false,
    priceRange: [0, 500]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 9;

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format products to match expected structure
        const formattedProducts = data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '/images/1.png',
          images: product.images || [product.image || '/images/1.png'],
          category: product.category,
          color: product.color || '',
          isNew: product.is_new || false,
          description: product.description || '',
          features: product.features || []
        }));
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when activeFilters change
  useEffect(() => {
    if (products.length === 0) return;
    
    let result = [...products];
    
    if (activeFilters.productType) {
      result = result.filter(p => p.productType === activeFilters.productType);
    }
    
    if (activeFilters.color) {
      result = result.filter(p => p.color === activeFilters.color);
    }
    
    if (activeFilters.isNew) {
      result = result.filter(p => p.isNew);
    }
    
    result = result.filter(p => 
      p.price >= activeFilters.priceRange[0] && 
      p.price <= activeFilters.priceRange[1]
    );
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilters, products]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Get unique categories and colors for filters
  const categories = [...new Set(products.map(p => p.category))];
  const colors = [...new Set(products.map(p => p.color).filter(Boolean))];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of product grid
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
      window.scrollTo({
        top: productGrid.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="py-4 max-w-6xl mx-auto px-4">
      {/* Banner Carousel removed */}

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="glass p-4 rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for shoes..."
              className="w-full py-3 px-4 pr-12 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-color"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  setFilteredProducts(products);
                } else {
                  setFilteredProducts(
                    products.filter(p => 
                      p.name.toLowerCase().includes(searchTerm) || 
                      p.category.toLowerCase().includes(searchTerm) ||
                      p.color.toLowerCase().includes(searchTerm)
                    )
                  );
                }
                setCurrentPage(1);
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold uppercase tracking-wider mb-8"
      >
        Shop All
      </motion.h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:w-64 flex-shrink-0"
        >
          <div className="glass p-6 rounded-lg sticky top-24">
            <h2 className="text-xl font-bold mb-6">Filters</h2>
            
            {/* Product Type Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Product Type</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="type-all" 
                    name="productType" 
                    checked={activeFilters.productType === ''}
                    onChange={() => handleFilterChange('productType', '')}
                    className="mr-2"
                  />
                  <label htmlFor="type-all">All Types</label>
                </div>
                {['Customs', 'Materials', 'Paints', 'Plain'].map(type => (
                  <div key={type} className="flex items-center">
                    <input 
                      type="radio" 
                      id={`type-${type.toLowerCase()}`}
                      name="productType"
                      checked={activeFilters.productType === type}
                      onChange={() => handleFilterChange('productType', type)}
                      className="mr-2"
                    />
                    <label htmlFor={`type-${type.toLowerCase()}`}>{type}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Color Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Color</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="color-all" 
                    name="color" 
                    checked={activeFilters.color === ''}
                    onChange={() => handleFilterChange('color', '')}
                    className="mr-2"
                  />
                  <label htmlFor="color-all">All Colors</label>
                </div>
                {colors.map(color => (
                  <div key={color} className="flex items-center">
                    <input 
                      type="radio" 
                      id={`color-${color.toLowerCase()}`}
                      name="color"
                      checked={activeFilters.color === color}
                      onChange={() => handleFilterChange('color', color)}
                      className="mr-2"
                    />
                    <label htmlFor={`color-${color.toLowerCase()}`}>{color}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* New Arrivals Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">New Arrivals</h3>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="new-arrivals" 
                  checked={activeFilters.isNew}
                  onChange={() => handleFilterChange('isNew', !activeFilters.isNew)}
                  className="mr-2"
                />
                <label htmlFor="new-arrivals">Show only new arrivals</label>
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Price Range</h3>
              <div className="flex justify-between mb-2">
                <span>£{activeFilters.priceRange[0]}</span>
                <span>£{activeFilters.priceRange[1]}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="50"
                value={activeFilters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [activeFilters.priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
            
            {/* Clear Filters Button */}
            <button 
              onClick={() => setActiveFilters({
                productType: '',
                color: '',
                isNew: false,
                priceRange: [0, 500]
              })}
              className="w-full glass-button py-2 text-sm uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        </motion.div>
        
        {/* Product Grid */}
        <motion.div 
          id="product-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1"
        >
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{filteredProducts.length} products</p>
          </div>
          
          {loading ? (
            <div className="glass p-8 text-center rounded-lg">
              <div className="flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-accent-color mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="glass p-8 text-center rounded-lg">
              <p className="text-red-500">Error loading products: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 underline"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass p-8 text-center rounded-lg">
              <p className="text-gray-500">No products match your selected filters.</p>
              <button 
                onClick={() => setActiveFilters({
                  category: '',
                  color: '',
                  isNew: false,
                  priceRange: [0, 500]
                })}
                className="mt-4 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="flex flex-col h-full"
                  >
                    <Link href={`/shop/product/${product.id}`} className="h-full">
                      <div className="glass-card h-full flex flex-col">
                        <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden">
                          {product.isNew && (
                            <div className="absolute top-2 left-2 z-10 bg-accent-color text-white text-xs px-2 py-1 rounded-full font-medium">
                              New
                            </div>
                          )}
                          <Image 
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover p-2 sm:p-4 transition-all duration-500 hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-3 sm:p-5 flex-grow flex flex-col">
                          <h3 className="font-bold text-primary-color text-sm sm:text-base line-clamp-1">{product.name}</h3>
                          <p className="text-accent-color font-bold mt-1 text-base sm:text-lg">£{product.price}</p>
                          <div className="mt-auto pt-2 sm:pt-4">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-full glass-button py-1.5 sm:py-2.5 rounded-full uppercase tracking-wider text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all text-center"
                            >
                              Buy Now
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex justify-center items-center gap-2 my-12"
                >
                  <button 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full flex items-center ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'glass-button'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Prev
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(num => {
                        // Show first page, last page, current page, and pages around current page
                        return num === 1 || 
                               num === totalPages || 
                               (num >= currentPage - 1 && num <= currentPage + 1);
                      })
                      .map((number, index, array) => {
                        // Add ellipsis
                        if (index > 0 && array[index - 1] !== number - 1) {
                          return (
                            <span key={`ellipsis-${number}`} className="flex items-center px-3">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <motion.button
                            key={number}
                            onClick={() => paginate(number)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              currentPage === number 
                                ? 'bg-accent-color text-white' 
                                : 'glass-card hover:bg-gray-100'
                            }`}
                          >
                            {number}
                          </motion.button>
                        );
                      })}
                  </div>
                  
                  <button 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-full flex items-center ${
                      currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'glass-button'
                    }`}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
