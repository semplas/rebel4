import React from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash } from 'react-icons/fa';

<<<<<<< HEAD
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    is_new?: boolean;
    description?: string;
    stock?: number;
  };
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
=======
const ProductCard = ({ product, onEdit, onDelete }) => {
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
  return (
    <div className="amazon-card overflow-hidden">
      <div className="relative h-48 bg-gray-100">
        {product.images && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
        
        {product.is_new && (
          <span className="absolute top-2 left-2 bg-accent-color text-black text-xs px-2 py-1 rounded">
            New
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
<<<<<<< HEAD
        <p className="text-accent-color font-bold mb-2">£{parseFloat(product.price.toString()).toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Stock: {product.stock || 0}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
=======
        <p className="text-accent-color font-bold mb-2">£{parseFloat(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
