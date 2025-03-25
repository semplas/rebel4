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
  const colors = ['Black', 'Brown', 'White', 'Tan', 'Gray'];
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

// Component that uses client hooks
function ShopPageContent() {
  return (
    <div>
      {/* Page content goes here */}
      <h1>Shop Page</h1>
    </div>
  );
}

// Main page component with Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
