'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Mock product data - expanded to 50 products
const generateProducts = () => {
  const categories = ['Formal', 'Casual', 'Athletic', 'Boots'];
  const colors = ['Black', 'Brown', 'White', 'Tan', 'Gray', 'Beige', 'Navy', 'Burguny'];
  const baseProducts = [
    { name: "Rebel Classic Oxford", basePrice: 249.99, category: "Formal" },
    { name: "Urban Street Runner", basePrice: 189.99, category: "Athletic" },
    { name: "Awaknd Leather Boot", basePrice: 299.99, category: "Boots" },
    { name: "Signature Loafer", basePrice: 219.99, category: "Casual" },
    { name: "Limited Edition Chelsea Boot", basePrice: 279.99, category: "Boots" },
    { name: "Classic Brogue", basePrice: 259.99, category: "Formal" },
    { name: "Minimalist Sneaker", basePrice: 179.99, category: "Athletic" },
    { name: "Suede Desert Boot", basePrice: 229.99, category: "Casual" },
    { name: "Premium Derby", basePrice: 269.99, category: "Formal" },
    { name: "Everyday Slip-on", basePrice: 159.99, category: "Casual" },
  ];
  
  const products = [];
  
  for (let i = 0; i < 50; i++) {
    const baseProduct = baseProducts[i % baseProducts.length];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const priceVariation = Math.floor(Math.random() * 30) - 15; // -15 to +15
    
    products.push({
      id: (i + 1).toString(),
      name: `${color} ${baseProduct.name}`,
      price: Math.round((baseProduct.basePrice + priceVariation) * 100) / 100,
      image: "/images/1.png",
      category: baseProduct.category,
      color: color,
      isNew: i < 10, // First 10 products are new
    });
  }
  
  return products;
};

const products = generateProducts();

// Banner data
const banners = [
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "Lightweight styles for warmer days",
    image: "/images/1.png",
    buttonText: "Shop Now",
    buttonLink: "/shop?category=casual",
    color: "from-blue-900 to-purple-900"
  },
  {
    id: 2,
    title: "Formal Essentials",
    subtitle: "Elevate your professional wardrobe",
    image: "/images/1.png",
    buttonText: "Discover",
    buttonLink: "/shop?category=formal",
    color: "from-gray-900 to-black"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Be the first to wear our latest designs",
    image: "/images/1.png",
    buttonText: "View Collection",
    buttonLink: "/shop?new=true",
    color: "from-amber-700 to-red-800"
  }
];

export default function ShopPage() {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    color: '',
    isNew: false,
    priceRange: [0, 500]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Filter products when activeFilters change
  useEffect(() => {
    let result = [...products];
    
    if (activeFilters.category) {
      result = result.filter(p => p.category === activeFilters.category);
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
  }, [activeFilters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Get unique categories and colors for filters
  const categories = [...new Set(products.map(p => p.category))];
  const colors = [...new Set(products.map(p => p.color))];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of product grid
    window.scrollTo({
      top: document.getElementById('product-grid').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  return (
    <div className="py-4 max-w-6xl mx-auto px-4">
      {/* Banner Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Swiper
          modules={[Navigation, SwiperPagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-lg overflow-hidden"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className={`bg-gradient-to-r ${banner.color} h-64 md:h-80 relative`}>
                <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
                  <div className="text-white md:w-1/2 text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-lg opacity-90 mb-6">{banner.subtitle}</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link href={banner.buttonLink} className="glass-button bg-white text-black px-8 py-3 inline-block font-bold">
                        {banner.buttonText}
                      </Link>
                    </motion.div>
                  </div>
                  <div className="md:w-1/3 relative h-32 md:h-56 w-32 md:w-56">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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
          className="w-full md:w-64 shrink-0"
        >
          <div className="glass p-6 sticky top-24">
            <h2 className="font-bold uppercase tracking-wider mb-6">Filters</h2>
            
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Category</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-all" 
                    name="category" 
                    checked={activeFilters.category === ''}
                    onChange={() => handleFilterChange('category', '')}
                    className="mr-2"
                  />
                  <label htmlFor="category-all">All Categories</label>
                </div>
                {categories.map(category => (
                  <div key={category} className="flex items-center">
                    <input 
                      type="radio" 
                      id={`category-${category.toLowerCase()}`}
                      name="category"
                      checked={activeFilters.category === category}
                      onChange={() => handleFilterChange('category', category)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category.toLowerCase()}`}>{category}</label>
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
                category: '',
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
          
          {filteredProducts.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={`/shop/product/${product.id}`} className="glass-card block">
                      <div className="h-64 bg-gray-100 relative">
                        <Image 
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover p-2 transition-transform duration-500 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {product.isNew && (
                          <div className="absolute top-2 right-2 z-10 bg-black text-white text-xs px-2 py-1 uppercase tracking-wider">
                            New
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                        <h3 className="font-medium text-sm line-clamp-1 mt-1">{product.name}</h3>
                        <p className="text-accent-color font-bold mt-1">£{product.price}</p>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-3 w-full glass-button text-sm py-1"
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'glass-button'}`}
                    >
                      Previous
                    </button>
                    
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
                            <span key={`ellipsis-${number}`} className="flex items-center px-4 py-2">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-4 py-2 rounded-md ${
                              currentPage === number 
                                ? 'bg-black text-white' 
                                : 'glass-button'
                            }`}
                          >
                            {number}
                          </button>
                        );
                      })}
                    
                    <button 
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'glass-button'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}