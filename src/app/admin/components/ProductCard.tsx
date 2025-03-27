import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

<<<<<<< Updated upstream
<<<<<<< HEAD
=======
// Keep this outside the component
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  
  // If it's already a data URL (from file upload preview), return as is
  if (imageUrl.startsWith('data:')) return imageUrl;
  
  // If it's a relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  // If it's a Supabase URL with the storage path format
  if (imageUrl.includes('/storage/v1/object/public/images/')) {
    return imageUrl; // It's already a complete URL
  }
  
  // If it's just the filename or path without the full URL
  if (!imageUrl.startsWith('http')) {
    const path = imageUrl.startsWith('images/') ? imageUrl : `images/${imageUrl}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  }
  
  // Otherwise return the URL as is
  return imageUrl;
};

>>>>>>> Stashed changes
interface ProductCardProps {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
<<<<<<< Updated upstream
=======
const ProductCard = ({ product, onEdit, onDelete }) => {
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
=======
  // Move this inside the component
  const getValidImageUrl = React.useCallback((product) => {
    // Check if product has images array with at least one item
    if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      return getImageUrl(product.images[0]);
    }
    
    // Fallback to product.image if available
    if (product.image) {
      return getImageUrl(product.image);
    }
    
    // Final fallback to placeholder
    return '/placeholder-image.jpg';
  }, []);

>>>>>>> Stashed changes
  return (
    <div className="amazon-card overflow-hidden">
      <div className="relative h-48 bg-gray-100">
        <img
          src={getValidImageUrl(product)}
          alt={product.name || "Product image"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Only set src if it's not already the placeholder
            if (e.currentTarget.src !== `${window.location.origin}/placeholder-image.jpg`) {
              e.currentTarget.src = "/placeholder-image.jpg";
            }
          }}
          loading="lazy" // Add lazy loading
        />
        
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
