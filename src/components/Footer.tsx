import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass-footer py-12 px-8 sm:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">AWAKND REBEL</h3>
          <p className="text-gray-700 mb-4">
            Creating unique, handcrafted footwear and supplies for shoe enthusiasts.
          </p>
          <div className="flex space-x-4">
            {/* Social icons */}
            {['facebook', 'twitter', 'instagram'].map((social) => (
              <a key={social} href="#" className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-purple-100 transition-colors">
                {social[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Shoes</h3>
          <ul className="space-y-2">
            {['All Products', 'New Arrivals', 'Best Sellers', 'Sale'].map((item) => (
              <li key={item}>
                <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">About</h3>
          <ul className="space-y-2">
            {['Our Story', 'Craftsmanship', 'Materials', 'Sustainability'].map((item) => (
              <li key={item}>
                <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Customer Service</h3>
          <ul className="space-y-2">
            {['Contact Us', 'FAQs', 'Shipping & Returns', 'Size Guide'].map((item) => (
              <li key={item}>
                <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AWAKND REBEL. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
