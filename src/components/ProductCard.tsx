import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <div className="glass-card">
      <Link href={`/shop/product/${id}`}>
        <div className="relative h-64 bg-gray-200">
          {image ? (
            <Image 
              src={image} 
              alt={name} 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Product Image
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs uppercase tracking-wider text-gray-500">{category}</span>
          <h3 className="font-bold uppercase mt-1">{name}</h3>
          <p className="text-gray-700 mt-1 font-medium">£{price}</p>
          <button className="mt-3 w-full glass-button bg-black text-white py-2 uppercase tracking-wider text-sm font-bold">
            View Product
          </button>
        </div>
      </Link>
    </div>
  );
}