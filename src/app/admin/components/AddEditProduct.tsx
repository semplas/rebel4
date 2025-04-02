'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSave, FaTimes, FaUpload, FaTrash, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductFormProps {
  editingProduct?: any;
  onClose: () => void;
  onSave: () => void;
}

// Add this function at the top of the file, outside the component
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  
  console.log("getImageUrl processing:", imageUrl);
  
  // If it's already a data URL (from file upload preview), return as is
  if (imageUrl.startsWith('data:')) return imageUrl;
  
  // If it's a relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  // If it's a Supabase URL with the storage path format
  if (imageUrl.includes('/storage/v1/object/public/')) {
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

export default function AddEditProduct({ editingProduct, onClose, onSave }: ProductFormProps) {
  const supabase = createClientComponentClient();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([null, null, null]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [previewUrls, setPreviewUrls] = useState<string[]>(['', '', '']);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  // Function to get a valid image URL for display
  const getValidImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.jpg';
    
    console.log("Processing image URL:", url);
    
    try {
      const processedUrl = getImageUrl(url);
      console.log("Processed URL:", processedUrl);
      return processedUrl || '/placeholder-image.jpg';
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/placeholder-image.jpg';
    }
  };

  // Add this function inside the component
  const getProductImageUrl = (product, index = 0) => {
    if (!product) return '/placeholder-image.jpg';
    
    // Parse images if they're stored as a JSON string
    let parsedImages = [];
    try {
      if (product.images) {
        // Check if images is a string that needs to be parsed
        if (typeof product.images === 'string') {
          parsedImages = JSON.parse(product.images);
        } else if (Array.isArray(product.images)) {
          parsedImages = product.images;
        }
      }
    } catch (error) {
      console.error("Error parsing images in getProductImageUrl:", error);
      parsedImages = [];
    }
    
    // Check if product has images array with the specified index
    if (parsedImages && parsedImages.length > index && parsedImages[index]) {
      return parsedImages[index];
    }
    
    // Fallback to product.image if available and index is 0
    if (index === 0 && product.image) {
      return product.image;
    }
    
    // Final fallback to placeholder
    return '/placeholder-image.jpg';
  };

  // Initialize form with product data if editing
  useEffect(() => {
    if (editingProduct) {
      console.log("Editing product data:", editingProduct);
      
      // Parse images if they're stored as a JSON string
      let parsedImages = [];
      try {
        if (editingProduct.images) {
          // Check if images is a string that needs to be parsed
          if (typeof editingProduct.images === 'string') {
            parsedImages = JSON.parse(editingProduct.images);
            console.log("Successfully parsed images from JSON string:", parsedImages);
          } else if (Array.isArray(editingProduct.images)) {
            parsedImages = editingProduct.images;
            console.log("Images already in array format:", parsedImages);
          }
        }
      } catch (error) {
        console.error("Error parsing images:", error);
        parsedImages = [];
      }
      
      // Generate preview URLs for existing images
      const newPreviewUrls = [0, 1, 2].map(index => {
        if (parsedImages && parsedImages.length > index && parsedImages[index]) {
          return parsedImages[index];
        }
        return '';
      });
      
      console.log("Final preview URLs:", newPreviewUrls);
      setPreviewUrls(newPreviewUrls);
      
      // Safely handle images array
      let imagesArray = ['', '', ''];
      if (parsedImages && parsedImages.length > 0) {
        // Take up to 3 images from the existing array
        const existingImages = parsedImages.slice(0, 3);
        // Fill the rest with empty strings
        imagesArray = [...existingImages, ...Array(3 - existingImages.length).fill('')];
      }
      
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

  // Check and create bucket if it doesn't exist
  const checkAndCreateBucket = async () => {
    try {
      // Just check if bucket exists, don't try to create it
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log("Error listing buckets:", listError);
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'images');
      
      if (!bucketExists) {
        console.log("Bucket 'images' doesn't exist. Please create it in the Supabase dashboard.");
      }
    } catch (err) {
      console.log('Error checking bucket:', err);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...productForm.features];
    newFeatures[index] = value;
    setProductForm({...productForm, features: newFeatures});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        alert(`File too large. Maximum size is 2MB.`);
        return;
      }
      
      // Create a new array with the selected file at the specified index
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles[index] = file;
      setSelectedFiles(newSelectedFiles);
      
      // Clean up previous preview URL if it exists
      if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(previewUrls[index]);
      }
      
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls[index] = previewUrl;
      setPreviewUrls(newPreviewUrls);
      
      console.log(`Preview created for image ${index}:`, previewUrl);
    }
  };

  // Add a function to handle removing images
  const handleRemoveImage = (index: number) => {
    // Clean up the object URL to prevent memory leaks
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Reset the file input, preview URL, and selected file
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = '';
    }
    
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = '';
    setPreviewUrls(newPreviewUrls);
    
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = null;
    setSelectedFiles(newSelectedFiles);
    
    // Reset upload progress
    const newProgress = [...uploadProgress];
    newProgress[index] = 0;
    setUploadProgress(newProgress);
    
    console.log(`Removed image at index ${index}`);
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
        
        setSuccessMessage('Product updated successfully!');
      } else {
        // Insert new product
        result = await supabase
          .from('products')
          .insert(productData);
        
        setSuccessMessage('Product added successfully!');
      }
      
      if (result.error) {
        throw result.error;
      }
      
      console.log("Product saved successfully:", result);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds and close modal
      setTimeout(() => {
        setShowSuccessMessage(false);
        onSave();
      }, 3000);
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex justify-between items-center ${editingProduct ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {editingProduct ? (
                <>
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Edit Product: {editingProduct.name}
                </>
              ) : (
                <>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Add New Product
                </>
              )}
            </h2>
            {editingProduct && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Product ID: {editingProduct.id}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {editingProduct ? (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                You are editing an existing product. All changes will update the current product.
              </p>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                You are creating a new product. Fill in the details and click Add Product to save.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-8">
            {/* Basic Info Section */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Type
                  </label>
                  <select
                    name="productType"
                    value={productForm.productType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="Shoes">Shoes</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={productForm.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g. Red, Blue, Black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={productForm.is_new}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mark as New Product</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Description Section */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Description</h3>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white min-h-[120px]"
                rows={4}
                placeholder="Describe your product..."
              />
            </div>
            
            {/* Features Section */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Product Features</h3>
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={`feature-${index}`} className="relative">
                    <input
                      type="text"
                      value={productForm.features[index]}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder={`Feature ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Images Section */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Product Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((index) => (
                  <div key={`image-${index}`} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {previewUrls[index] ? (
                        <div className="relative w-full h-full">
                          {/* Enhanced image preview with better error handling */}
                          <img 
                            src={previewUrls[index]}
                            alt={`Product image ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-contain p-2"
                            onError={(e) => {
                              console.error(`Image load error for preview ${index}:`, previewUrls[index]);
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                            onLoad={() => console.log(`Image ${index} loaded successfully:`, previewUrls[index])}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                            Preview (not uploaded yet)
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
                            aria-label="Remove image"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center p-4">
                            <FaUpload size={28} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Click to upload</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              JPG, PNG or WebP (max 2MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRefs[index]}
                            onChange={(e) => handleFileChange(e, index)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                          />
                        </>
                      )}
                    </div>
                    
                    {/* Upload progress indicator */}
                    {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-700 h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5" 
                          style={{ width: `${uploadProgress[index]}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* File information section */}
                    {selectedFiles[index] && (
                      <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="truncate max-w-[80%]">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {selectedFiles[index].name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(selectedFiles[index].size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          
                          {previewUrls[index] && (
                            <button
                              type="button"
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 dark:text-blue-400 px-2 py-1 rounded"
                              onClick={() => {
                                if (fileInputRefs[index].current) {
                                  fileInputRefs[index].current.click();
                                }
                              }}
                            >
                              Change
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Debug information to help troubleshoot */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  For best results, use square images (800×800px) less than 2MB in size.
                </p>
              </div>
            </div>
            
            {/* Success Message */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl z-50 p-6 max-w-md w-full"
                role="alert"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Success!</h3>
                <p className="text-center text-gray-700 dark:text-gray-300 text-lg">{successMessage}</p>
                <div className="mt-6 flex justify-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <motion.div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white rounded-lg transition-colors flex items-center ${
                  editingProduct 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
