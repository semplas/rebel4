import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
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
          <div className="flex items-center space-x-4">
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
            <CartIcon />
          </div>
        </div>
      </div>
    </nav>
  );
}