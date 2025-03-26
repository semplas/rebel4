'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function About() {
  return (
    <div className="py-4 max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="glass p-8 md:p-12 rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h1>
              <p className="text-lg mb-6">
                Awaknd Rebel was founded with a simple mission: to create premium footwear that combines craftsmanship, 
                style, and sustainability. Every pair of shoes we make tells a story of dedication to quality and design.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/shop" className="glass-button bg-accent-color text-black px-8 py-3 inline-block font-bold">
                  Shop Collection
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-80">
              <Image
                src="/images/1.png"
                alt="Our workshop"
                fill
                className="object-cover rounded-lg"
              />
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

      {/* Team Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider">Our Team</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {[
            {
              name: "Alex Morgan",
              role: "Founder & Designer",
              image: "/images/1.png",
              social: {
                twitter: "https://twitter.com",
                instagram: "https://instagram.com",
                linkedin: "https://linkedin.com"
              }
            },
            {
              name: "Jamie Chen",
              role: "Master Craftsperson",
              image: "/images/1.png",
              social: {
                twitter: "https://twitter.com",
                instagram: "https://instagram.com",
                linkedin: "https://linkedin.com"
              }
            },
            {
              name: "Sam Rivera",
              role: "Sustainability Director",
              image: "/images/1.png",
              social: {
                twitter: "https://twitter.com",
                instagram: "https://instagram.com",
                linkedin: "https://linkedin.com"
              }
            }
          ].map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-32 h-32 relative rounded-full overflow-hidden mb-4 border-2 border-accent-color">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className="text-gray-600 mb-3">{member.role}</p>
              <div className="flex space-x-3">
                <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" 
                   className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <FaTwitter className="text-gray-700" />
                </a>
                <a href={member.social.instagram} target="_blank" rel="noopener noreferrer"
                   className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <FaInstagram className="text-gray-700" />
                </a>
                <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                   className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <FaLinkedinIn className="text-gray-700" />
                </a>
              </div>
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
