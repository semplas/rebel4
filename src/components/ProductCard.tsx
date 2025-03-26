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
    <div className="glass-card group overflow-hidden">
      <Link href={`/shop/product/${id}`}>
        <div className="relative h-64 bg-gradient-to-b from-gray-50 to-gray-100">
          {image ? (
            <Image 
              src={image} 
              alt={name} 
              fill 
              className="object-cover p-4 transition-all duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Product Image
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs font-medium text-accent-color rounded-full">
            {category}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-primary-color uppercase mt-1 tracking-wide line-clamp-1">{name}</h3>
          <p className="text-accent-color font-bold mt-1 text-lg">£{price}</p>
          <button className="mt-4 w-full glass-button py-2.5 rounded-md uppercase tracking-wider text-sm font-bold shadow-md hover:shadow-lg transition-all">
            Buy Now
          </button>
        </div>
      </Link>
    </div>
  );
}
