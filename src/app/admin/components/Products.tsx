'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client at the component level
const supabase = createClientComponentClient();

export default function Products({ initialShowAddProduct = false, isAuthenticated = true }) {
  // Remove the local authentication state and use the prop instead
  const [isAdmin, setIsAdmin] = useState(true);
  
  // Add authChecked state
  const [authChecked, setAuthChecked] = useState(false);
  
  // Add a specific saving state with a default value of false
  const [isSaving, setIsSaving] = useState(false);
  
  // Add state to track uploading images
  const [uploadingImages, setUploadingImages] = useState([false, false, false]);
  
  // Add missing state variables
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([null, null, null]);
  
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

  // Add file input refs
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

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
      console.log('Saving product, isSaving state:', true);
      
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
      
      // Prepare product data for saving
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        description: productForm.description,
        // Filter out empty image URLs
        images: productForm.images.filter(img => img),
        // Filter out empty feature strings
        features: productForm.features.filter(feature => feature),
        color: productForm.color,
        is_new: productForm.is_new,
        stock: parseInt(productForm.stock, 10) || 0
      };
      
      console.log('Saving product data:', productData);

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        // Update local state
        setProducts(products.map(p => p.id === editingProduct.id ? {...p, ...productData} : p));
        console.log('Product updated successfully');
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();
        
        if (error) throw error;
        
        // Update local state with the returned data
        setProducts([data[0], ...products]);
        console.log('Product created successfully');
      }
      
      // Reset selected files
      setSelectedFiles([null, null, null]);
      setShowProductModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      console.log('Setting isSaving state to false');
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

  // Check authentication status only once when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('User is authenticated');
          
          // Check if user is admin (optional)
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            // You can check for admin role here if needed
            setIsAdmin(true);
          }
        } else {
          console.log('User is not authenticated');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, keep user in admin state to prevent modal
        setIsAdmin(true);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []); // Empty dependency array ensures this runs only once

  // Initialize modal state based on prop
  useEffect(() => {
    if (initialShowAddProduct) {
      handleAddProduct();
    }
  }, [initialShowAddProduct]);

  return (
    <div id="products-section" className="bg-white rounded-xl shadow-amazon p-6">
      {/* Only show login modal if authentication has been checked AND user is not authenticated */}
      {authChecked && !isAuthenticated && (
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    className="amazon-input w-full" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    className="amazon-input w-full" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="amazon-button-primary w-full"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Products</h2>
            <button
              onClick={handleAddProduct}
              className="amazon-button-primary flex items-center text-sm"
              data-action="add-product"
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
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
                    &times;
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProduct();
                  }}>
                    {/* Form fields would go here */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Product name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      
                      {/* More form fields would go here */}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setShowProductModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="amazon-button-primary flex items-center"
                      >
                        {isSaving ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Save Product
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
