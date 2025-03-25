import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="glass-footer py-8 sm:py-12 px-4 sm:px-8 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">AWAKND REBEL</h3>
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Creating unique, handcrafted footwear and supplies for shoe enthusiasts.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
              <FaFacebook className="h-4 w-4" />
            </a>
            <a href="#" className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
              <FaTwitter className="h-4 w-4" />
            </a>
            <a href="#" className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
              <FaInstagram className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Shop</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li><Link href="/shop" className="hover:text-purple-600 transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=formal" className="hover:text-purple-600 transition-colors">Formal</Link></li>
            <li><Link href="/shop?category=casual" className="hover:text-purple-600 transition-colors">Casual</Link></li>
            <li><Link href="/shop?category=athletic" className="hover:text-purple-600 transition-colors">Athletic</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li><Link href="/about" className="hover:text-purple-600 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact</Link></li>
            <li><Link href="/careers" className="hover:text-purple-600 transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-purple-600 transition-colors">Blog</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Support</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li><Link href="/faq" className="hover:text-purple-600 transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-purple-600 transition-colors">Shipping</Link></li>
            <li><Link href="/returns" className="hover:text-purple-600 transition-colors">Returns</Link></li>
            <li><Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm">
        <p>© {new Date().getFullYear()} Awaknd Rebel. All rights reserved.</p>
      </div>
    </footer>
  );
}