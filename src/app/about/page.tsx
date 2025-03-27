'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function About() {
  return (
    <div className="py-4 max-w-6xl mx-auto px-4">
      {/* Business Owner Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">The Founder's Journey</h1>
              <p className="text-lg mb-4">
                Awaknd Rebel was born from a passion for exceptional footwear and a vision to create something truly unique in the industry.
              </p>
              <p className="text-lg mb-6">
                "I started this journey with the belief that premium footwear should combine artisanal craftsmanship with bold, distinctive design. 
                Every pair we create is inspired by the rebel spirit that dares to stand out and make a statement through personal style."
              </p>
              <p className="text-lg italic mb-6">
                — James Wilson, Founder
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/shop" className="glass-button bg-accent-color text-black px-8 py-3 inline-block font-bold">
                  Explore Our Vision
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2 flex justify-center order-1 md:order-2 mb-8 md:mb-0">
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900 to-purple-900 opacity-20 -m-2"></div>
                <Image
                  src="/images/1.png"
                  alt="James Wilson - Founder of Awaknd Rebel"
                  fill
                  className="rounded-full border-4 border-accent-color object-cover shadow-xl"
                  sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Craftsmanship",
              description: "Every pair is handcrafted with attention to detail and quality materials.",
              icon: "🔨"
            },
            {
              title: "Sustainability",
              description: "We're committed to ethical sourcing and environmentally friendly practices.",
              icon: "🌱"
            },
            {
              title: "Innovation",
              description: "Constantly pushing boundaries in design and comfort technology.",
              icon: "💡"
            }
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="glass p-6 rounded-lg"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p>{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section - This is the "Shop Now" section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <div className="glass p-8 md:p-12 rounded-lg bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the Rebel Movement</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Experience the perfect blend of style, comfort, and craftsmanship with our premium footwear collection.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/shop" className="glass-button bg-accent-color text-black px-8 py-3 font-bold">
                Shop Now
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
