'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaDownload, FaTimes, FaCheck, FaTruck, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import BrandLoader from '@/components/BrandLoader';

// Order type definition
interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_image?: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_email: string;
  customer_name?: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: string;
  items?: OrderItem[];
}

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch orders from Supabase
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Limit to latest 10 orders by default

      if (error) throw error;

      // Fetch customer names for each order
      const ordersWithCustomers = await Promise.all(
        (data || []).map(async (order) => {
          if (order.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', order.user_id)
              .single();
            
            return {
              ...order,
              customer_name: userData?.full_name || 'Unknown'
            };
          }
          return order;
        })
      );

      setOrders(ordersWithCustomers);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          price,
          products (
            name,
            image
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      // Format the data to match our OrderItem interface
      const formattedItems = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        product_image: item.products?.image
      }));

      setOrderItems(formattedItems);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    await fetchOrderItems(order.id);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowOrderDetails(false);
    }
  };

  const handleExportOrders = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Total', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer_name || 'Unknown',
        order.customer_email,
        format(new Date(order.created_at), 'yyyy-MM-dd'),
        order.total.toFixed(2),
        order.status
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) || 
      (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase();
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateRange.from && dateRange.to) {
      const orderDate = new Date(order.created_at);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59); // Include the entire "to" day
      
      matchesDateRange = orderDate >= fromDate && orderDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FaCheck className="mr-1" />;
      case 'processing':
        return <FaFilter className="mr-1" />;
      case 'shipped':
        return <FaTruck className="mr-1" />;
      case 'pending':
        return <FaExclamationTriangle className="mr-1" />;
      case 'cancelled':
        return <FaTimes className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      
      {/* Filters and Search */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by order ID, customer name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            onClick={handleExportOrders}
            className="glass px-4 py-2 rounded-md font-medium flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <FaDownload className="mr-2" /> Export
          </button>
        </div>
        
        {/* Date Range Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ from: '', to: '' })}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer_name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer_email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">£{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-gray-600 hover:text-black p-1"
                        title="View Order Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-gray-500">No orders found matching your filters.</p>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                  <p className="font-medium">{selectedOrder.customer_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_email || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-2">User ID: {selectedOrder.user_id || 'N/A'}</p>
                </div>
                
                <div className="glass p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                  <p className="text-sm">
                    <span className="font-medium">Created:</span> {format(new Date(selectedOrder.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Last Updated:</span> {format(new Date(selectedOrder.updated_at || selectedOrder.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Total:</span> £{selectedOrder.total.toFixed(2)}
                  </p>
                </div>
                
                <div className="glass p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                  <p className="text-sm whitespace-pre-line">{selectedOrder.shipping_address || 'No address provided'}</p>
                </div>
              </div>
              
              {/* Status Management */}
              <div className="glass p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status as Order['status'])}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                {orderItems.length > 0 ? (
                  <div className="glass rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.product_image && (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name} 
                                    className="h-10 w-10 object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="glass p-4 rounded-lg">
                    <p className="text-gray-500">No items found for this order.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
