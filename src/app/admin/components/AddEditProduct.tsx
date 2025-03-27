'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSave, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductFormProps {
  editingProduct?: any;
  onClose: () => void;
  onSave: () => void;
}

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  
  console.log("Processing image URL:", imageUrl);
  
  // If it's already a data URL (from file upload preview), return as is
  if (imageUrl.startsWith('data:')) {
    console.log("→ Data URL detected, returning as is");
    return imageUrl;
  }
  
  // If it's a relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    const absoluteUrl = `${window.location.origin}${imageUrl}`;
    console.log("→ Relative URL detected, converted to:", absoluteUrl);
    return absoluteUrl;
  }
  
  // If it's a Supabase URL with the storage path format
  if (imageUrl.includes('/storage/v1/object/public/')) {
    console.log("→ Complete Supabase URL detected, returning as is");
    return imageUrl; // It's already a complete URL
  }
  
  // If it's just the filename or path without the full URL
  if (!imageUrl.startsWith('http')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log("→ SUPABASE URL:", supabaseUrl);
    
    // Handle both "images/filename.jpg" and just "filename.jpg"
    const path = imageUrl.startsWith('images/') ? imageUrl : `images/${imageUrl}`;
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/${path}`;
    
    console.log("→ Partial URL detected, converted to:", fullUrl);
    return fullUrl;
  }
  
  // Otherwise return the URL as is
  console.log("→ Full URL detected, returning as is");
  return imageUrl;
};

const debugImageUrl = (imageUrl: string, context: string) => {
  console.log(`[${context}] Image URL:`, imageUrl);
  if (imageUrl) {
    const processed = getImageUrl(imageUrl);
    console.log(`[${context}] Processed URL:`, processed);
    return processed;
  }
  return '';
};

const getValidImageUrl = (imageUrl) => {
  if (!imageUrl) return '/placeholder-image.jpg';
  
  // Process the URL
  const processedUrl = getImageUrl(imageUrl);
  console.log(`Processing image URL: ${imageUrl} -> ${processedUrl}`);
  
  return processedUrl;
};

export default function AddEditProduct({ editingProduct, onClose, onSave }: ProductFormProps) {
  const supabase = createClientComponentClient();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    images: ['', '', ''],
    features: ['', '', ''],
    color: '',
    is_new: false,
    stock: '0',
    productType: 'Shoes' // Default to Shoes
  });

  useEffect(() => {
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  }, []);

  // Initialize form with product data if editing
  useEffect(() => {
    if (editingProduct) {
      console.log("Editing product data:", editingProduct);
      console.log("Images from DB:", editingProduct.images);
      
      // Safely handle images array
      let imagesArray = ['', '', ''];
      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        console.log("Images array is valid, length:", editingProduct.images.length);
        // Take up to 3 images from the existing array
        const existingImages = editingProduct.images.slice(0, 3);
        
        // Debug each image URL
        existingImages.forEach((img, idx) => {
          console.log(`Raw image ${idx}:`, img);
          console.log(`Processed image ${idx}:`, getImageUrl(img));
        });
        
        // Fill the rest with empty strings
        imagesArray = [...existingImages, ...Array(3 - existingImages.length).fill('')];
      } else {
        console.log("Images array is invalid or missing:", editingProduct.images);
      }
      
      console.log("Final images array:", imagesArray);
      
      // Set form data with images
      setProductForm({
        name: editingProduct.name || '',
        price: editingProduct.price?.toString() || '',
        description: editingProduct.description || '',
        images: imagesArray,
        features: editingProduct.features && Array.isArray(editingProduct.features) 
          ? [...editingProduct.features.slice(0, 3), ...Array(3 - Math.min(editingProduct.features.length, 3)).fill('')]
          : ['', '', ''],
        color: editingProduct.color || '',
        is_new: editingProduct.is_new || false,
        stock: editingProduct.stock?.toString() || '0',
        productType: editingProduct.product_type || 'Shoes'
      });
    }
  }, [editingProduct]);

  // Check if bucket exists and create it if needed
  const checkAndCreateBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'images');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
        });
      }
    } catch (err) {
      console.error('Error checking/creating bucket:', err);
    }
  };

  const debugSupabaseTable = async () => {
    try {
      console.log("Checking Supabase table structure...");
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error("Error fetching table structure:", error);
      } else {
        console.log("Table structure sample:", data);
      }
    } catch (err) {
      console.error("Error in debug function:", err);
    }
  };

  useEffect(() => {
    checkAndCreateBucket();
    debugSupabaseTable();
  }, []);

  const handleFileChange = (index: number, file: File | null) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = file;
    setSelectedFiles(newSelectedFiles);
    
    // Preview the image
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...productForm.images];
        newImages[index] = e.target?.result as string;
        setProductForm({...productForm, images: newImages});
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, index: number) => {
    if (!file) return null;
    
    // Add file size check
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return null;
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        onUploadProgress: (progress) => {
          const newProgress = [...uploadProgress];
          newProgress[index] = progress.percent || 0;
          setUploadProgress(newProgress);
        }
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...productForm.images];
    newImages[index] = '';
    setProductForm({...productForm, images: newImages});
    
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = null;
    setSelectedFiles(newSelectedFiles);
    
    // Reset file input
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log("Starting save process...");
      
      // Upload any selected files first
      const uploadPromises = [];
      const newImages = [...productForm.images];
      
      for (let i = 0; i < 3; i++) {
        if (selectedFiles[i]) {
          uploadPromises.push(
            uploadImage(selectedFiles[i]!, i)
              .then(url => {
                if (url) {
                  console.log(`Image ${i} uploaded successfully:`, url);
                  newImages[i] = url;
                }
              })
              .catch(err => {
                console.error(`Error uploading image ${i}:`, err);
              })
          );
        }
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        console.log("All images uploaded, final image array:", newImages);
      }
      
      // Prepare product data for saving - simplify to essential fields first
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: productForm.description,
        images: newImages.filter(img => img),
        product_type: productForm.productType,
        color: productForm.color,
        is_new: productForm.is_new,
        stock: parseInt(productForm.stock) || 0,
        features: productForm.features.filter(f => f)
      };
      
      console.log("Saving product with data:", productData);
      
      let result;
      if (editingProduct) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        // Insert new product
        result = await supabase
          .from('products')
          .insert(productData);
      }
      
      if (result.error) {
        console.error("Supabase error:", result.error);
        throw result.error;
      }
      
      console.log("Save successful:", result);
      
      // Reset form and close modal
      onSave();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Failed to save product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Product name */}
              <div>
                <label className="amazon-label">
                  Product Name*
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="amazon-input w-full"
                  required
                />
              </div>
              
              {/* Price */}
              <div>
                <label className="amazon-label">
                  Price (£)*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="amazon-input w-full"
                  required
                />
              </div>
              
              {/* Product Type */}
              <div>
                <label className="amazon-label">
                  Product Type*
                </label>
                <select
                  value={productForm.productType}
                  onChange={(e) => setProductForm({...productForm, productType: e.target.value})}
                  className="amazon-input w-full"
                  required
                >
                  <option value="Shoes">Shoes</option>
                  <option value="Materials">Materials</option>
                  <option value="Paints">Paints</option>
                  <option value="Plain">Plain</option>
                </select>
              </div>
              
              {/* Stock */}
              <div>
                <label className="amazon-label">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="amazon-input w-full"
                />
              </div>
              
              {/* Color */}
              <div>
                <label className="amazon-label">
                  Color
                </label>
                <input
                  type="text"
                  value={productForm.color}
                  onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                  className="amazon-input w-full"
                  placeholder="e.g. Black, Red, Blue"
                />
              </div>
              
              {/* Is New */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_new"
                  checked={productForm.is_new}
                  onChange={(e) => setProductForm({...productForm, is_new: e.target.checked})}
                  className="h-4 w-4 text-accent-color focus:ring-accent-color border-gray-300 rounded"
                />
                <label htmlFor="is_new" className="ml-2 block text-sm text-gray-900">
                  Mark as New Product
                </label>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="amazon-label">
                Description
              </label>
              <textarea
                rows={4}
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="amazon-input w-full"
                placeholder="Enter product description..."
              />
            </div>
            
            {/* Features */}
            <div className="mb-6">
              <label className="amazon-label">
                Key Features (up to 3)
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <input
                    key={`feature-${index}`}
                    type="text"
                    value={productForm.features[index]}
                    onChange={(e) => {
                      const newFeatures = [...productForm.features];
                      newFeatures[index] = e.target.value;
                      setProductForm({...productForm, features: newFeatures});
                    }}
                    className="amazon-input w-full"
                    placeholder={`Feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Images */}
            <div className="mb-6">
              <label className="amazon-label">
                Product Images (up to 3)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {[0, 1, 2].map((index) => (
                  <div key={`image-${index}`} className="border rounded-lg p-4 bg-gray-50">
                    <div className="aspect-square relative mb-3 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {productForm.images[index] ? (
                        <>
                          <div className="relative w-full h-full">
                            <img 
                              src={getValidImageUrl(productForm.images[index])}
                              alt={`Product image ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Image ${index} failed to load:`, productForm.images[index]);
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              aria-label="Remove image"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 text-sm">No image</div>
                      )}
                      
                      {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border-4 border-accent-color border-t-transparent animate-spin"></div>
                          <div className="absolute text-white font-bold">{Math.round(uploadProgress[index])}%</div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRefs[index]}
                      onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      className="hidden"
                      id={`image-upload-${index}`}
                    />
                    <label
                      htmlFor={`image-upload-${index}`}
                      className="amazon-button-secondary w-full flex items-center justify-center text-sm"
                    >
                      <FaUpload className="mr-2" /> 
                      {productForm.images[index] ? 'Change Image' : 'Upload Image'}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Images should be less than 2MB in size. Recommended dimensions: 800x800px.
              </p>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => console.log("Current form state:", productForm)}
                className="text-sm text-gray-500"
              >
                Debug Form
              </button>
              
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="amazon-button-secondary mr-2"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="amazon-button"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
