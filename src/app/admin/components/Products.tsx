'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client at the component level
const supabase = createClientComponentClient();

export default function Products() {
  // Add state for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        
        // Check if user is admin
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (data?.is_admin) {
          setIsAdmin(true);
        } else {
          console.warn('User is not an admin');
        }
      } else {
        console.error('Not authenticated');
        // Redirect to login or show message
      }
    };
    
    checkAuth();
  }, []);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add a specific saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Add state to track uploading images
  const [uploadingImages, setUploadingImages] = useState([false, false, false]);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Formal',
    description: '',
    images: ['', '', ''],
    features: ['', '', ''],
    color: '',
    is_new: false,
    stock: '0'
  });
  
  // Products state
  const [products, setProducts] = useState([]);

  // Add file input refs
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  // Add state to track selected files
  const [selectedFiles, setSelectedFiles] = useState([null, null, null]);

  // Add this function to check if the bucket exists and create it if needed
  const checkAndCreateBucket = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'images');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket('images', {
          public: true, // Make bucket public
          fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
        });
        
        if (error) throw error;
        console.log('Created images bucket');
      }
    } catch (err) {
      console.error('Error checking/creating bucket:', err);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    checkAndCreateBucket();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      category: 'Formal',
      description: '',
      images: ['', '', ''],
      features: ['', '', ''],
      color: '',
      is_new: false,
      stock: '0'
    });
    setSelectedFiles([null, null, null]); // Reset selected files
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || 'Formal',
      description: product.description || '',
      images: Array.isArray(product.images) && product.images.length > 0 
        ? [...product.images.slice(0, 3), ...Array(3 - Math.min(product.images.length, 3)).fill('')] 
        : [product.image || '', '', ''],
      features: Array.isArray(product.features) && product.features.length > 0
        ? [...product.features.slice(0, 3), ...Array(3 - Math.min(product.features.length, 3)).fill('')]
        : ['', '', ''],
      color: product.color || '',
      is_new: product.is_new || false,
      stock: (product.stock || 0).toString()
    });
    setSelectedFiles([null, null, null]); // Reset selected files
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
          
        if (error) throw error;
        
        // Update local state
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const saveProduct = async () => {
    try {
      setIsSaving(true); // Set saving state to true when starting the save process
      
      // Upload any selected files first
      const uploadPromises = [];
      const newImages = [...productForm.images];
      
      for (let i = 0; i < 3; i++) {
        if (selectedFiles[i]) {
          uploadPromises.push(
            uploadImage(selectedFiles[i], i)
              .then(url => {
                if (url) newImages[i] = url;
              })
          );
        }
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        // Update form with new image URLs
        setProductForm({...productForm, images: newImages});
      }
      
      // Format the product data
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        description: productForm.description,
        image: newImages[0] || '/images/1.png', // Use primary image
        images: newImages,
        features: Array.isArray(productForm.features) 
          ? productForm.features.filter(f => f.trim() !== '')
          : [],
        color: productForm.color,
        is_new: productForm.is_new,
        stock: parseInt(productForm.stock)
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        // Update local state
        setProducts(products.map(p => p.id === editingProduct.id ? {...p, ...productData} : p));
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();
        
        if (error) throw error;
        
        // Update local state with the returned data
        setProducts([data[0], ...products]);
      }
      
      // Reset selected files
      setSelectedFiles([null, null, null]);
      setShowProductModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false); // Reset saving state when done
    }
  };

  // Modified upload function with better authentication handling
  const uploadImage = async (file, index) => {
    if (!file) return null;
    
    // Add file size check
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return null;
    }
    
    try {
      // Set uploading state for this image
      const newUploadingState = [...uploadingImages];
      newUploadingState[index] = true;
      setUploadingImages(newUploadingState);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Try to refresh the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          throw new Error('You must be logged in to upload images');
        }
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      alert(`Failed to upload image: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      // Reset uploading state for this image
      const newUploadingState = [...uploadingImages];
      newUploadingState[index] = false;
      setUploadingImages(newUploadingState);
    }
  };

  return (
    <div>
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Admin Login Required</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.email.value;
              const password = e.target.password.value;
              
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              if (error) {
                alert(`Login failed: ${error.message}`);
              } else {
                // Refresh the page or update state
                window.location.reload();
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Products</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddProduct}
              className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add Product
            </motion.button>
          </div>
          
          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sold || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Product Modal */}
          {showProductModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  <button 
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                      <input 
                        type="text" 
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)*</label>
                      <input 
                        type="number" 
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                      >
                        <option value="Formal">Formal</option>
                        <option value="Casual">Casual</option>
                        <option value="Athletic">Athletic</option>
                        <option value="Limited">Limited Edition</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
                      <input 
                        type="number" 
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full border rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                      placeholder="Enter product description"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Product Images (Up to 3)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-2">
                          <div className={`border-2 border-dashed rounded-lg p-2 ${index === 0 ? 'border-black' : 'border-gray-300'}`}>
                            <div className="h-40 bg-gray-50 rounded relative">
                              {uploadingImages[index] ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span className="text-xs mt-2">Uploading...</span>
                                </div>
                              ) : productForm.images[index] ? (
                                <>
                                  <Image 
                                    src={productForm.images[index]} 
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-contain p-2"
                                  />
                                  <button 
                                    onClick={() => {
                                      const newImages = [...productForm.images];
                                      newImages[index] = '';
                                      setProductForm({...productForm, images: newImages});
                                    }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                                  >
                                    <FaTrash className="text-red-500" size={14} />
                                  </button>
                                </>
                              ) : (
                                <div 
                                  onClick={() => fileInputRefs[index].current?.click()}
                                  className="flex flex-col items-center justify-center h-full cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  <span className="text-xs mt-2">Upload image</span>
                                </div>
                              )}
                              <input 
                                type="file"
                                ref={fileInputRefs[index]}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    // Store the file in state instead of uploading immediately
                                    const newFiles = [...selectedFiles];
                                    newFiles[index] = e.target.files[0];
                                    setSelectedFiles(newFiles);
                                    
                                    // Show a preview of the selected file
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const newImages = [...productForm.images];
                                      newImages[index] = event.target.result;
                                      setProductForm({...productForm, images: newImages});
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                                accept="image/*"
                              />
                            </div>
                            <div className="flex mt-2">
                              <input 
                                type="text" 
                                value={productForm.images[index] || ''}
                                onChange={(e) => {
                                  const newImages = [...productForm.images];
                                  newImages[index] = e.target.value;
                                  setProductForm({...productForm, images: newImages});
                                }}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                placeholder="Or enter image URL"
                                disabled={uploadingImages[index]}
                              />
                            </div>
                          </div>
                          {index === 0 && <p className="text-xs text-gray-500">Primary image (required)</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                      <span>Product Features</span>
                      <span className="text-xs text-gray-500">(Add up to 3 key features)</span>
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <input 
                          key={index}
                          type="text" 
                          value={Array.isArray(productForm.features) ? (productForm.features[index] || '') : ''}
                          onChange={(e) => {
                            const newFeatures = Array.isArray(productForm.features) ? [...productForm.features] : ['', '', ''];
                            newFeatures[index] = e.target.value;
                            setProductForm({...productForm, features: newFeatures});
                          }}
                          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                          placeholder={`Feature ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input 
                        type="text" 
                        value={productForm.color}
                        onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                        placeholder="e.g. Black, Red, Blue"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer mt-6">
                        <input 
                          type="checkbox" 
                          checked={productForm.is_new}
                          onChange={(e) => setProductForm({...productForm, is_new: e.target.checked})}
                          className="rounded text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-gray-700">Mark as New Arrival</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4 sticky bottom-0">
                  <button 
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveProduct}
                    className={`px-6 py-2 bg-black text-white rounded-md flex items-center hover:bg-gray-800 transition-colors ${isSaving ? 'opacity-70' : ''}`}
                    disabled={!productForm.name || !productForm.price || !productForm.images[0] || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Save Product
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
