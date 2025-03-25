import { useState, useEffect } from 'react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/lib/products';
import ProductForm from './ProductForm';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaShoppingBag } from 'react-icons/fa';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandLoader from '@/components/BrandLoader';

export default function ProductsTab({ products: initialProducts, setProducts: updateParentProducts }) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  // Sync local state with parent state when initialProducts changes
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('You must be logged in to access this page');
          // Redirect to login page
          router.push('/admin/login?redirect=/admin');
          return;
        }
        
        // Get the user's profile to check admin status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !profile || !profile.is_admin) {
          toast.error('You must be an admin to access this page');
          // Redirect to home page
          router.push('/');
          return;
        }
        
        // If we get here, user is authenticated and is admin
        // Load products
        loadProducts();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Failed to verify admin status');
        router.push('/');
      }
    };
    
    checkAdminStatus();
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      // Update parent state
      if (updateParentProducts) {
        updateParentProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await deleteProduct(id);
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      // Update parent state
      if (updateParentProducts) {
        updateParentProducts(updatedProducts);
      }
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      setLoading(true);
      
      let updatedProducts = [...products];
      
      if (currentProduct) {
        // Update existing product
        const updatedProduct = await updateProduct(currentProduct.id, productData);
        
        // Replace the product in the array
        const index = updatedProducts.findIndex(p => p.id === currentProduct.id);
        if (index !== -1) {
          updatedProducts[index] = updatedProduct;
        }
        
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const newProduct = await createProduct(productData);
        updatedProducts = [newProduct, ...updatedProducts];
        
        toast.success('Product created successfully');
      }
      
      setProducts(updatedProducts);
      // Update parent state
      if (updateParentProducts) {
        updateParentProducts(updatedProducts);
      }
      
      setShowProductForm(false);
      setCurrentProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message || 'Unknown error'}`);
      // Don't hide the form on error so user can try again
      throw error; // Re-throw so the form component can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setCurrentProduct(null);
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Products Management</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow"
            >
              <FaPlus size={14} /> Add Product
            </button>
          </div>
        </div>
      </div>

      {loading && !showProductForm ? (
        <div className="w-full py-8">
          <BrandLoader />
        </div>
      ) : (
        <>
          {showProductForm ? (
            <div className="p-6">
              <ProductForm
                product={currentProduct || undefined}
                onSave={handleSaveProduct}
                onCancel={handleCancelForm}
              />
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-gray-50 rounded-full p-6 mb-4">
                    <FaShoppingBag className="text-gray-300 text-4xl" />
                  </div>
                  <p className="text-gray-500 mb-4 text-center">
                    {searchTerm ? 'No products match your search criteria' : 'No products found in your inventory'}
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FaPlus size={14} /> Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th 
                          onClick={() => handleSort('name')}
                          className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            Product {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {sortField !== 'name' && '↕'}
                            </span>
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('category')}
                          className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {sortField !== 'category' && '↕'}
                            </span>
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('price')}
                          className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {sortField !== 'price' && '↕'}
                            </span>
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('stock')}
                          className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            Stock {sortField === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {sortField !== 'stock' && '↕'}
                            </span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-100 rounded-md overflow-hidden">
                                {product.image ? (
                                  <img
                                    className="h-10 w-10 object-cover"
                                    src={product.image}
                                    alt={product.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 flex items-center justify-center">
                                    <FaShoppingBag className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                {product.isNew && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stock > 0 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock > 0 ? product.stock : 'Out of stock'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors"
                                title="Edit product"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                                title="Delete product"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
