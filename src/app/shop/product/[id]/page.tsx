import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Mock product data - ensure this matches the data in the shop page
const products = {
  "1": {
    id: "1",
    name: "Rebel Classic Oxford",
    price: 249.99,
    image: "/images/1.png",
    category: "Formal",
    description: "Handcrafted leather oxford shoes made with premium materials. Each pair is custom made to your specifications and measurements.",
    features: [
      "Premium full-grain leather",
      "Custom sizing",
      "Hand-stitched details",
      "Cork footbed for comfort",
      "Leather sole with rubber inserts"
    ]
  },
  "2": {
    id: "2",
    name: "Urban Street Runner",
    price: 189.99,
    image: "/images/1.png",
    category: "Casual",
    description: "Lightweight and comfortable sneakers designed for urban exploration. Modern styling with premium materials.",
    features: [
      "Breathable mesh upper",
      "Cushioned insole",
      "Flexible rubber outsole",
      "Reflective details",
      "Reinforced heel counter"
    ]
  },
  "3": {
    id: "3",
    name: "Awaknd Leather Boot",
    price: 299.99,
    image: "/images/1.png",
    category: "Boots",
    description: "Rugged yet refined leather boots built to last. Perfect for both city streets and weekend adventures.",
    features: [
      "Full-grain waterproof leather",
      "Goodyear welt construction",
      "Shock-absorbing insole",
      "Vibram outsole",
      "Brass hardware"
    ]
  }
};

// Add generateStaticParams to pre-render all product pages at build time
export function generateStaticParams() {
  return Object.keys(products).map(id => ({
    id: id,
  }));
}

// Properly typed params for Next.js App Router
type ProductParams = {
  id: string;
};

export default function ProductDetail({ params }: { params: ProductParams }) {
  // Check if the product exists in our data
  const product = products[params.id as keyof typeof products];
  
  // If product doesn't exist, show the 404 page
  if (!product) {
    return notFound();
  }
  
  return (
    <div className="py-8">
      <div className="mb-4">
        <Link href="/shop" className="text-sm uppercase tracking-wider font-medium hover:underline">
          ← Back to Shop
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 h-[500px] relative">
          {product.image ? (
            <div className="relative w-full h-full">
              <Image 
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Product Image</span>
            </div>
          )}
        </div>
        
        <div>
          <span className="inline-block bg-black text-white px-3 py-1 text-sm uppercase tracking-wider mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{product.name}</h1>
          <p className="text-2xl font-medium mb-6">£{product.price}</p>
          
          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {product.features && (
            <div className="mb-8">
              <h3 className="font-medium uppercase tracking-wider mb-3">Features:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-32">
                <label className="block text-sm uppercase tracking-wider mb-1">Quantity</label>
                <select className="w-full border border-black px-3 py-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button className="w-full bg-black text-white py-3 uppercase tracking-wider font-bold">
              Add to Cart
            </button>
            
            <button className="w-full border border-black py-3 uppercase tracking-wider font-bold">
              Save to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}