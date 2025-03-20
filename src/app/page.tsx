'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  // Featured products
  const featuredProducts = [
    { id: "1", name: "Rebel Classic Oxford", price: 249.99, image: "/images/1.png" },
    { id: "2", name: "Urban Street Runner", price: 189.99, image: "/images/1.png" },
    { id: "3", name: "Awaknd Leather Boot", price: 299.99, image: "/images/1.png" },
    { id: "4", name: "Signature Loafer", price: 219.99, image: "/images/1.png" },
  ];

  // Categories with placeholder images
  const categories = [
    { name: 'Formal', image: '/images/1.png' },
    { name: 'Casual', image: '/images/1.png' },
    { name: 'Athletic', image: '/images/1.png' },
    { name: 'Boots', image: '/images/1.png' }
  ];

  return (
    <div className="py-4">
      {/* Hero Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 relative"
      >
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:w-1/2 mb-8 md:mb-0 text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Footwear for Every Occasion</h1>
              <p className="text-lg mb-6 opacity-90">Handcrafted with premium materials and designed for those who appreciate quality.</p>
              <div className="flex space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/shop" className="glass-button bg-accent-color text-black px-8 py-3 inline-block font-bold">
                    Shop Now
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/about" className="border border-white text-white px-8 py-3 inline-block font-bold hover:bg-white hover:text-blue-900 transition-colors">
                    Our Story
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative w-[350px] h-[350px] md:w-[400px] md:h-[400px]">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '3s' }}></div>
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

      {/* Category Cards */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link href={`/shop?category=${category.name.toLowerCase()}`} className="relative group block">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image 
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70 to-transparent opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-medium">{category.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Products Carousel */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Link href="/shop" className="text-accent-secondary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/shop/product/${product.id}`} className="glass-card block hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  <Image 
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover p-2 transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
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
      </motion.section>

      {/* Deal of the Day */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <span className="inline-block bg-accent-color text-black px-3 py-1 text-sm font-bold rounded-sm mb-4">
                DEAL OF THE DAY
              </span>
              <h2 className="text-2xl font-bold mb-2">Rebel Classic Oxford - Limited Edition</h2>
              <p className="text-gray-700 mb-4">Exclusive colorway available for a limited time. Premium leather with custom detailing.</p>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-accent-color">£199.99</span>
                <span className="ml-2 text-sm line-through text-gray-500">£249.99</span>
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded">SAVE 20%</span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/shop/product/1" className="glass-button inline-block">
                  Shop Now
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/3 bg-white p-4 rounded-lg overflow-hidden">
              <motion.div 
                className="aspect-square relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Image 
                  src="/images/1.png"
                  alt="Deal of the Day"
                  fill
                  className="object-cover rounded-md"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Join Our Newsletter</h2>
          <p className="mb-6 max-w-md mx-auto text-gray-600">Subscribe for exclusive offers, new releases, and more.</p>
          <form className="max-w-md mx-auto flex">
            <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 border border-gray-300 rounded-l-sm focus:outline-none focus:ring-1 focus:ring-accent-color" />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="glass-button rounded-l-none"
            >
              Subscribe
            </motion.button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}