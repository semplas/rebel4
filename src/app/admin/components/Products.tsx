'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
import AddEditProduct from './AddEditProduct';
import ProductCard from './ProductCard';

export default function Products() {
  const supabase = createClientComponentClient();
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

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

  const handleSaveProduct = () => {
    setShowProductModal(false);
    fetchProducts(); // Refresh the product list
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          
          {filteredProducts.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              No products found. {searchQuery ? 'Try a different search term.' : 'Add your first product!'}
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
