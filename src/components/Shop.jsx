'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import BrandLoader from './BrandLoader';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get featured products
  const featuredProducts = products.slice(0, 5);
  
  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading) return <BrandLoader />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Our Shop</h1>
          <p className="text-lg text-gray-600">Discover our exclusive collection of premium products</p>
        </motion.div>

        {/* Featured Products Carousel */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
          <Swiper
            modules={[Navigation, SwiperPagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="product-swiper"
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                  <div className="h-48 p-4 flex items-center justify-center bg-gray-100">
                    <img src={product.image} alt={product.title} className="max-h-full object-contain" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-medium mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-xl font-bold mb-4">${product.price.toFixed(2)}</p>
                    <button className="mt-auto bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* All Products Grid with Pagination */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
              >
                <div className="h-48 p-4 flex items-center justify-center bg-gray-100">
                  <img src={product.image} alt={product.title} className="max-h-full object-contain" />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <span className="text-sm text-gray-500 uppercase mb-1">{product.category}</span>
                  <h3 className="text-lg font-medium mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-xl font-bold mb-4">${product.price.toFixed(2)}</p>
                  <button className="mt-auto bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 gap-2">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md ${
                    currentPage === i + 1 
                      ? 'bg-black text-white' 
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;
