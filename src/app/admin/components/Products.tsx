'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch } from 'react-icons/fa';
import AddEditProduct from './AddEditProduct';
import ProductCard from './ProductCard';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    console.log("Empty image URL provided");
    return '';
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

export default function Products({ initialShowAddProduct = false, isAuthenticated = true }) {
  const [isAdmin, setIsAdmin] = useState(true);
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(initialShowAddProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([null, null, null]);
  const [viewMode, setViewMode] = useState('grid');
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    images: ['', '', ''],
    productType: '',
    color: '',
    is_new: false,
    stock: '0',
    features: ['']
  });

  // Define getValidImageUrl function
  const getValidImageUrl = useCallback((product) => {
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

  // Fetch products function
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

  // Handle add product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  // Handle delete product
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

  // Handle save product
  const handleSaveProduct = async () => {
    // Implementation here
    console.log("Saving product");
    setShowProductModal(false);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Set initial state based on props
  useEffect(() => {
    setShowProductModal(initialShowAddProduct);
  }, [initialShowAddProduct]);

  return (
    <div id="products-section" className="bg-white rounded-xl shadow-amazon p-6">
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
          </div>
        </div>
      </div>

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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={getValidImageUrl(product)} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEditProduct(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
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
