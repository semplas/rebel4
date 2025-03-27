'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
import AddEditProduct from './AddEditProduct';
import ProductCard from './ProductCard';

<<<<<<< HEAD
export default function Products() {
  const supabase = createClientComponentClient();
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
<<<<<<< HEAD
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
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
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        // Find the product to get image paths before deletion
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        // Delete product from the products table
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
          
        if (error) throw error;
        
        // Delete related entries in product_categories junction table
        const { error: junctionError } = await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', productId);
        
        if (junctionError) {
          console.error('Error deleting product category relations:', junctionError);
          // Continue with deletion process even if this fails
        }
        
        // Delete related images from storage if they exist
        if (productData) {
          // Delete main image if it exists and is stored in Supabase
          if (productData.image && productData.image.includes('storage')) {
            try {
              const imagePath = productData.image.split('/').pop();
              if (imagePath) {
                await supabase.storage.from('images').remove([imagePath]);
              }
            } catch (imageError) {
              console.error('Error deleting main product image:', imageError);
            }
          }
          
          // Delete additional images if they exist
          if (Array.isArray(productData.images)) {
            for (const imageUrl of productData.images) {
              if (imageUrl && imageUrl.includes('storage')) {
                try {
                  const imagePath = imageUrl.split('/').pop();
                  if (imagePath) {
                    await supabase.storage.from('images').remove([imagePath]);
                  }
                } catch (imageError) {
                  console.error('Error deleting additional product image:', imageError);
                }
              }
            }
          }
        }
        
        // Update local state
        setProducts(products.filter(p => p.id !== productId));
        
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

<<<<<<< HEAD
  const handleSaveProduct = () => {
    setShowProductModal(false);
    fetchProducts(); // Refresh the product list
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
<<<<<<< HEAD
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAddProduct}
            className="amazon-button-primary flex items-center text-sm"
            data-action="add-product"
          >
            <FaPlus className="mr-2" /> Add Product
          </button>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="amazon-input w-full pr-10"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 ${viewMode === 'grid' ? 'bg-accent-color text-white' : 'bg-gray-100'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 ${viewMode === 'table' ? 'bg-accent-color text-white' : 'bg-gray-100'}`}
            >
              Table
            </button>
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : error ? (
        <div className="text-center p-4 text-red-500">Error: {error}</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditProduct(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          ) : (
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Image</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Stock</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b">
                      <td className="px-4 py-2">
                        <div className="w-16 h-16 relative">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                              No image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">${product.price}</td>
                      <td className="px-4 py-2">{product.category}</td>
                      <td className="px-4 py-2">{product.stock || 0}</td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-500 hover:text-red-700"
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
          )}
          
<<<<<<< HEAD
          {filteredProducts.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              No products found. {searchQuery ? 'Try a different search term.' : 'Add your first product!'}
=======
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
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
            </div>
          )}
        </>
      )}

      {showProductModal && (
        <AddEditProduct
          editingProduct={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
