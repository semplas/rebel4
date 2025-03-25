'use client'

import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaUser, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAdmin, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  
  return (
    <nav className="glass-navbar mb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl tracking-wider">
              <span className="text-2xl font-extrabold">AWAKND</span>
              <span className="ml-1 text-2xl">REBEL</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="px-3 py-2 rounded-md text-sm font-medium hover:text-purple-600 transition-colors">
              Shop
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:text-purple-600 transition-colors">
              About
            </Link>
            <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:text-purple-600 transition-colors">
              Admin
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass">
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-purple-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/shop" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-purple-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>
          <Link 
            href="/about" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-purple-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:text-purple-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}