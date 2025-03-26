'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(8);
          
        if (error) throw error;
        
        // Format products to match expected structure
        const formattedProducts = data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price || 0,
          image: product.image || '/images/1.png',
          isNew: product.is_new || false
        }));
        
        setFeaturedProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Categories data
  const categories = [
    { name: "Casual", image: "/images/1.png" },
    { name: "Formal", image: "/images/1.png" },
    { name: "Athletic", image: "/images/1.png" },
    { name: "Boots", image: "/images/1.png" }
  ];

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Timer complete - could reset or show "Deal Ended"
              clearInterval(timer);
              return prevTime;
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format time with leading zeros
  const formatTime = (value) => {
    return value.toString().padStart(2, '0');
  };

  // Auto-scrolling effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let animationId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    const containerWidth = scrollContainer.scrollWidth;
    
    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled half the items
      if (scrollPosition >= containerWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cancelAnimationFrame(animationId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [featuredProducts]);

  return (
    <div className="py-6">
      {/* Hero Banner - Modernized with asymmetric layout */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-12 relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 rounded-2xl shadow-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-16 flex flex-col md:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-1/2 mb-6 md:mb-0 text-white z-10 text-center md:text-left"
            >
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="inline-flex items-center bg-gradient-to-r from-accent-color to-accent-secondary text-white py-1.5 px-5 rounded-full shadow-lg gap-2 border border-white/20"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="uppercase tracking-wider text-xs font-bold">Limited Edition</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="inline-flex items-center bg-white/90 text-blue-900 py-1.5 px-5 rounded-full shadow-lg border border-white/20"
                >
                  <span className="text-xs font-bold mr-2">20% OFF</span>
                  <span className="bg-blue-900 text-white text-xs py-0.5 px-2 rounded tracking-wider font-mono">REBEL20</span>
                </motion.div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Step Into <span className="text-accent-color relative">
                  Premium
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-accent-color/40 rounded-full"></span>
                </span> Footwear
              </h1>
              <p className="text-base mb-6 opacity-90 max-w-md leading-relaxed">Handcrafted with premium materials for those who appreciate quality and distinctive style.</p>
              
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/shop" className="glass-button bg-accent-color text-black px-8 py-3 inline-block font-bold rounded-full shadow-md hover:shadow-lg transition-all">
                    Shop Collection
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/about" className="border border-white text-white px-8 py-3 inline-block font-bold rounded-full hover:bg-white hover:text-blue-900 transition-colors">
                    Our Story
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="md:w-1/2 flex justify-center relative"
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '3s' }}></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-accent-color/20 to-purple-500/20 rounded-full blur-3xl opacity-70"></div>
                <Image 
                  src="/images/1.png"
                  alt="Featured Product"
                  fill
                  className="object-cover rounded-full scale-110 hover:scale-125 transition-transform duration-700"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Category Cards - Refined Layout */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-20 max-w-6xl mx-auto px-4"
      >
        {/* Section Header */}
        <div className="mb-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs uppercase tracking-wider font-medium rounded-full"
          >
            Discover Your Style
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mt-3 mb-2"
          >
            Explore Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-gray-600 max-w-lg mx-auto"
          >
            Premium footwear for every occasion
          </motion.p>
        </div>

        {/* Refined grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="amazon-card group relative overflow-hidden rounded-lg"
            >
              <Link href={`/shop?category=${category.name.toLowerCase()}`} className="block h-full">
                <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
                  <Image 
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-color/90 via-primary-color/50 to-transparent"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="p-4 rounded-lg bg-white/90 backdrop-blur-sm">
                    <h3 className="text-primary-color text-xl font-bold mb-2">{category.name}</h3>
                    <div className="flex items-center">
                      <span className="amazon-button-primary py-1 px-3 text-sm inline-flex items-center">
                        Shop Now
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* View all button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            View All Categories
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </motion.div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-20 max-w-6xl mx-auto px-4 sm:px-6"
        id="featured-products"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-gray-100 text-primary-color text-xs uppercase tracking-wider font-medium rounded-full">Trending Now</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">Featured Collection</h2>
          </div>
          <Link href="/shop" className="text-accent-color hover:underline flex items-center gap-2 font-medium">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        
        {/* Auto-scrolling carousel */}
        <div className="relative overflow-hidden px-4 sm:px-0">
          <div 
            ref={scrollRef}
            className="flex space-x-3 sm:space-x-4 md:space-x-6 pb-8 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Loading placeholders
              Array(4).fill(0).map((_, index) => (
                <div 
                  key={`loading-${index}`}
                  className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] lg:min-w-[280px] flex-shrink-0"
                >
                  <div className="glass-card h-full flex flex-col animate-pulse">
                    <div className="h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200"></div>
                    <div className="p-3 sm:p-4 md:p-5">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // First set of products
              featuredProducts.map((product) => (
                <motion.div
                  key={`${product.id}-original`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] lg:min-w-[280px] flex-shrink-0"
                >
                  <Link href={`/shop/product/${product.id}`}>
                    <div className="glass-card h-full flex flex-col">
                      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                        {product.isNew && (
                          <div className="absolute top-3 left-3 z-10 bg-accent-color text-white text-xs px-2 py-1 rounded-full font-medium">
                            New Season
                          </div>
                        )}
                        <Image 
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover p-4 transition-all duration-500 hover:scale-110"
                        />
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                        <h3 className="font-bold text-primary-color line-clamp-1">{product.name}</h3>
                        <p className="text-accent-color font-bold mt-1 text-lg">£{product.price}</p>
                        <div className="mt-auto pt-4">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full glass-button py-2.5 rounded-full uppercase tracking-wider text-sm font-bold shadow-md hover:shadow-lg transition-all text-center"
                          >
                            Buy Now
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
            
            {/* Duplicate set for infinite scroll effect - only show if not loading */}
            {!loading && featuredProducts.map((product) => (
              <motion.div
                key={`${product.id}-duplicate`}
                whileHover={{ y: -8, scale: 1.02 }}
                className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] lg:min-w-[280px] flex-shrink-0"
              >
                <Link href={`/shop/product/${product.id}`}>
                  <div className="glass-card h-full flex flex-col">
                    <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                      {product.isNew && (
                        <div className="absolute top-3 left-3 z-10 bg-accent-color text-white text-xs px-2 py-1 rounded-full font-medium">
                          New Season
                        </div>
                      )}
                      <Image 
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover p-4 transition-all duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-primary-color line-clamp-1">{product.name}</h3>
                      <p className="text-accent-color font-bold mt-1 text-lg">£{product.price}</p>
                      <div className="mt-auto pt-4">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full glass-button py-2.5 rounded-full uppercase tracking-wider text-sm font-bold shadow-md hover:shadow-lg transition-all text-center"
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
          
          {/* Gradient overlays for infinite scroll effect */}
          <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-background-color to-transparent z-10"></div>
          <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-background-color to-transparent z-10"></div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-6 gap-1.5">
          <span className="w-8 h-1.5 rounded-full bg-accent-color"></span>
          <span className="w-2 h-1.5 rounded-full bg-gray-300"></span>
          <span className="w-2 h-1.5 rounded-full bg-gray-300"></span>
        </div>
      </motion.section>

      {/* Deal of the Day - Enhanced with countdown and urgency */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-16"
      >
        <div className="bg-gradient-to-br from-accent-color/10 to-accent-secondary/10 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-color/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-color/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row items-center relative z-10 p-8 md:p-12">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <div className="flex items-center mb-4">
                <span className="inline-block bg-accent-color text-white px-4 py-1 text-sm font-bold rounded-full mr-3 animate-pulse">
                  DEAL OF THE DAY
                </span>
                <div className="text-sm font-mono bg-black text-white px-3 py-1 rounded flex items-center">
                  <span>Ends in:</span>
                  <span className="ml-2 font-bold">
                    {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                  </span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Rebel Classic Oxford - Limited Edition</h2>
              <p className="text-gray-700 mb-6 max-w-lg">Exclusive colorway available for a limited time. Premium leather with custom detailing.</p>
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-accent-color">£199.99</span>
                <span className="ml-3 text-sm line-through text-gray-500">£249.99</span>
                <span className="ml-3 bg-accent-color/20 text-accent-color px-3 py-1 text-xs font-bold rounded-full">SAVE 20%</span>
              </div>
              <div className="mb-6 bg-accent-color/10 border-l-4 border-accent-color p-3">
                <p className="text-accent-color text-sm font-medium">
                  <span className="font-bold">🔥 Almost gone!</span> Only 5 pairs left in stock
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/shop/product/1" className="glass-button px-8 py-3 rounded-full inline-block font-bold">
                  Shop Now
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
                <div className="absolute inset-0 rounded-full bg-white shadow-xl"></div>
                
                {/* Larger Badge positioned in front of the image */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-600 to-red-700 text-white font-bold rounded-full h-28 w-28 flex items-center justify-center shadow-lg border-2 border-white z-10">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold leading-none">20%</div>
                    <div className="text-sm uppercase tracking-wider">OFF</div>
                  </div>
                </div>
                
                <Image 
                  src="/images/1.png"
                  alt="Deal of the Day"
                  fill
                  className="object-cover p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* WhatsApp Community Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
          
          {/* WhatsApp Icon - hide on small screens */}
          <div className="absolute -right-12 -bottom-12 opacity-20 hidden sm:block">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Join Our WhatsApp Community</h2>
            <p className="mb-4 sm:mb-8 text-gray-100 text-sm sm:text-base">Get exclusive offers, styling tips, and connect with fellow shoe enthusiasts directly on WhatsApp.</p>
            
            <div className="bg-white p-1 rounded-lg max-w-md mx-auto">
              <div className="flex items-center bg-gray-100 rounded-md p-2 sm:p-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">AWAKND REBEL Community</h3>
                  <p className="text-sm text-gray-600">120+ members • Active today</p>
                </div>
              </div>
              
              <motion.a 
                href="https://whatsapp.com/channel/your-channel-id" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-bold hover:bg-green-600 transition-colors w-full block text-center text-sm sm:text-base"
              >
                Join Community
              </motion.a>
            </div>
            
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-200">By joining, you agree to our Community Guidelines and Privacy Policy.</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// Add this CSS to hide scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
