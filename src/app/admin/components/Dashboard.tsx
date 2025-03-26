'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaImage, FaUpload, FaChartLine, FaShoppingBag, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard({ isAuthenticated }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]); // Add products state
  const [recentOrders, setRecentOrders] = useState([]); // Add recentOrders state
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    customerCount: 0
  });
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products with logging
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (productsError) {
          console.error('Products fetch error:', productsError);
          throw productsError;
        }
        
        console.log('Products fetched:', productsData?.length || 0, 'items');
        setProducts(productsData || []);
        
        // Get total product count
        const { count: productCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Product count error:', countError);
        }
        
        // Fetch recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (ordersError) {
          console.error('Orders fetch error:', ordersError);
        }
        
        setRecentOrders(ordersData || []);
        
        // Get total order count and revenue
        const { count: orderCount, error: orderCountError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        if (orderCountError) {
          console.error('Order count error:', orderCountError);
        }
        
        // Calculate total revenue
        let totalRevenue = 0;
        if (ordersData && ordersData.length > 0) {
          totalRevenue = ordersData.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        }
        
        // Get customer count
        const { count: customerCount, error: customerCountError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (customerCountError) {
          console.error('Customer count error:', customerCountError);
        }
        
        // Update stats with all counts
        setStats({
          productCount: productCount || 0,
          orderCount: orderCount || 0,
          revenue: totalRevenue || 0,
          customerCount: customerCount || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Add a timeout to force loading to false after 3 seconds as a fallback
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Dashboard: Forcing loading state to false after timeout');
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Function to handle product button click
  const handleAddProductClick = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    
    // Try to find and click the add product button
    try {
      // First try to navigate to products tab if we're not already there
      const productsTab = document.querySelector('[data-tab="products"]');
      if (productsTab instanceof HTMLElement) {
        productsTab.click();
      }
      
      // Small delay to ensure tab switch completes
      setTimeout(() => {
        const addProductButton = document.querySelector('[data-action="add-product"]');
        if (addProductButton instanceof HTMLElement) {
          addProductButton.click();
        } else {
          // If button not found, try direct navigation
          router.push('/admin?tab=products&action=add');
        }
      }, 100);
    } catch (error) {
      console.error("Error navigating to add product:", error);
      // Fallback to direct URL change as last resort
      window.location.href = '/admin?tab=products&action=add';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with welcome message */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="opacity-90">Here's what's happening with your store today</p>
      </motion.div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Products" 
          value={stats.productCount} 
          change={`${products && products.length > 0 ? products.length : 'No'} recently added`} 
          icon={<FaShoppingBag className="text-indigo-500" />} 
        />
        <StatsCard 
          title="Orders" 
          value={stats.orderCount} 
          change={`${recentOrders && recentOrders.length > 0 ? recentOrders.length : 'No'} recent orders`} 
          icon={<FaShoppingBag className="text-green-500" />} 
        />
        <StatsCard 
          title="Revenue" 
          value={`£${stats.revenue.toFixed(2)}`} 
          change="Total earnings" 
          icon={<FaMoneyBillWave className="text-emerald-500" />} 
        />
        <StatsCard 
          title="Customers" 
          value={stats.customerCount} 
          change="Registered users" 
          icon={<FaUsers className="text-blue-500" />} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Sales Overview</h2>
            <select className="border rounded-md px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <FaChartLine className="text-gray-300 text-5xl" />
            <span className="ml-3 text-gray-400">Sales chart will appear here</span>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-amazon p-6"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              type="button"
              className="w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors amazon-button-primary"
              onClick={handleAddProductClick}
            >
              <FaPlus className="mr-2" /> Add New Product
            </button>
            <ActionButton 
              icon={<FaImage className="mr-2" />}
              label="Add New Banner"
              onClick={() => window.location.href = '#banners'}
            />
            <ActionButton 
              icon={<FaUpload className="mr-2" />}
              label="Import Products"
              onClick={() => alert('Import functionality coming soon')}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-center">Loading orders...</td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{order.id.substring(0, 8)}</td>
                      <td className="px-4 py-3 text-sm">{order.customer_email || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">£{order.total || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-center">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a href="#orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View all orders →
            </a>
          </div>
        </motion.div>
        
        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
          {loading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : products && products.length > 0 ? (
            <ul className="space-y-4">
              {products.map(product => (
                <li key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name || 'Product'}
                        className="w-10 h-10 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.png';
                          console.log('Image failed to load:', product.image);
                        }}
                      />
                    ) : (
                      <FaShoppingBag className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name || 'Unnamed Product'}</h3>
                    <p className="text-sm text-gray-500">£{product.price || 0}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{product.stock || 0}</span>
                    <p className="text-xs text-gray-500">in stock</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              No products found. <button 
                onClick={handleAddProductClick} 
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Add your first product
              </button>
            </div>
          )}
          <div className="mt-4 text-right">
            <a href="#products" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View all products →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Updated StatsCard Component with better fallbacks
function StatsCard({ title, value, change, icon }) {
  // Ensure value is always a valid display value
  const displayValue = value !== undefined && value !== null ? value : 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold mt-1">{displayValue}</p>
          <p className="text-green-500 mt-1 text-sm">{change}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Action Button Component
function ActionButton({ primary, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center ${
        primary 
          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// Update the fetchDashboardData function to properly set product count
async function fetchDashboardData() {
  try {
    setLoading(true);
    console.log('Fetching dashboard data...');
    
    // Fetch products with logging
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (productsError) {
      console.error('Products fetch error:', productsError);
      throw productsError;
    }
    
    console.log('Products fetched:', productsData?.length || 0, 'items');
    
    // Get total product count
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Product count error:', countError);
    }
    
    // Fetch recent orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
    }
    
    // Get total order count and revenue
    const { count: orderCount, error: orderCountError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
      
    if (orderCountError) {
      console.error('Order count error:', orderCountError);
    }
    
    // Calculate total revenue
    let totalRevenue = 0;
    if (ordersData && ordersData.length > 0) {
      totalRevenue = ordersData.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    }
    
    // Get customer count
    const { count: customerCount, error: customerCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (customerCountError) {
      console.error('Customer count error:', customerCountError);
    }
    
    // Update state with all the data
    setProducts(productsData || []);
    setRecentOrders(ordersData || []);
    
    // Update stats with all counts
    setStats({
      productCount: productCount || 0,
      orderCount: orderCount || 0,
      revenue: totalRevenue || 0,
      customerCount: customerCount || 0
    });
    
    console.log('Dashboard stats updated:', {
      productCount: productCount || 0,
      orderCount: orderCount || 0,
      revenue: totalRevenue || 0,
      customerCount: customerCount || 0
    });
    
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  } finally {
    setLoading(false);
  }
}
