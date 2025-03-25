import React, { useState, useRef } from 'react';
import { Product } from '@/lib/supabase-types';
import { uploadProductImage } from '@/lib/products';
import { FaUpload, FaTrash, FaSave } from 'react-icons/fa';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  categories: string[];
  colors: string[];
}

export default function ProductForm({ product, onSave, onCancel, categories, colors }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || '',
    color: product?.color || '',
    image: product?.image || '',
    images: product?.images || [],
    features: product?.features || [],
    isNew: product?.isNew || false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), featureInput.trim()]
    }));
    
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const file = files[0];
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to storage
      const imageUrl = await uploadProductImage(file);
      
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
        images: [...(prev.images || []), imageUrl]
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const setMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setImagePreview(imageUrl);
  };

  const removeImage = (imageUrl: string) => {
    const updatedImages = (formData.images || []).filter(img => img !== imageUrl);
    
    // If we're removing the main image, set a new one
    let mainImage = formData.image;
    if (imageUrl === formData.image) {
      mainImage = updatedImages.length > 0 ? updatedImages[0] : '';
      setImagePreview(mainImage);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      images: updatedImages,
      image: mainImage
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (formData.price === undefined || formData.price === null) {
      setError('Product price is required');
      return;
    }
    
    if (!formData.category?.trim()) {
      setError('Product category is required');
      return;
    }
    
    // Validate numeric values
    const priceValue = typeof formData.price === 'string' ? 
      parseFloat(formData.price) : formData.price;
      
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Price must be a valid positive number');
      return;
    }
    
    // Validate stock value
    const stockValue = typeof formData.stock === 'string' ? 
      parseInt(formData.stock, 10) : (formData.stock || 0);
      
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock must be a valid positive number or zero');
      return;
    }
    
    // Process data before submission
    const processedData = {
      ...formData,
      price: priceValue,
      stock: stockValue,
      features: (formData.features || []).filter(f => f.trim() !== ''),
      name: formData.name?.trim(),
      category: formData.category?.trim(),
      description: formData.description || '',
      image: formData.image || '',
      isNew: formData.isNew || false
    };
    
    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price*</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Category*</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <select
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select Color</option>
            {colors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">New Product</label>
          <div className="mt-2">
            <input
              type="checkbox"
              name="isNew"
              checked={formData.isNew}
              onChange={handleChange}
              className="mr-2"
            />
            <span>Mark as new product</span>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Product Image</label>
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-24 w-24 bg-gray-100 rounded overflow-hidden relative">
            {imagePreview ? (
              <Image 
                src={imagePreview} 
                alt="Main product image" 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No image</div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100"
            disabled={loading}
          >
            <FaUpload /> {loading ? 'Uploading...' : 'Upload Image'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        {formData.images && formData.images.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">All Images</label>
            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className={`h-20 w-full bg-gray-100 rounded overflow-hidden relative ${img === formData.image ? 'ring-2 ring-blue-500' : ''}`}>
                    <Image 
                      src={img} 
                      alt={`Product image ${index + 1}`} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {img !== formData.image && (
                      <button
                        type="button"
                        onClick={() => setMainImage(img)}
                        className="p-1 bg-blue-500 text-white rounded-full mr-1"
                        title="Set as main image"
                      >
                        <FaSave size={10} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img)}
                      className="p-1 bg-red-500 text-white rounded-full"
                      title="Remove image"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Features</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2"
            placeholder="Add a product feature"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        
        {formData.features && formData.features.length > 0 && (
          <ul className="border rounded-md divide-y">
            {formData.features.map((feature, index) => (
              <li key={index} className="flex justify-between items-center p-2">
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}