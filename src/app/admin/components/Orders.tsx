'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// Define TypeScript interfaces for our data
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_email: string;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string;
  items?: OrderItem[];
  user_id: string;
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        
        // Fetch orders with user profiles
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format the orders
        const formattedOrders = data.map((order: any) => ({
          ...order,
          // Format date for display
          created_at: new Date(order.created_at).toLocaleDateString()
        }));
        
        setOrders(formattedOrders);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, []);

  // Fetch order items when an order is selected
  useEffect(() => {
    async function fetchOrderItems() {
      if (!selectedOrder) return;
      
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price,
            products (
              id,
              name
            )
          `)
          .eq('order_id', selectedOrder.id);
          
        if (error) throw error;
        
        // Format the items
        const items = data.map((item: any) => ({
          id: item.id,
          name: item.products.name,
          price: item.price,
          quantity: item.quantity
        }));
        
        setSelectedOrder({
          ...selectedOrder,
          items
        });
      } catch (err) {
        console.error('Error fetching order items:', err);
      }
    }
    
    if (selectedOrder && !selectedOrder.items) {
      fetchOrderItems();
    }
  }, [selectedOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? {...order, status: newStatus} : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Update the status colors to match Amazon theme
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Processing': return 'bg-warning-color/20 text-warning-color';
      case 'Shipped': return 'bg-link-color/20 text-link-color';
      case 'Delivered': return 'bg-success-color/20 text-success-color';
      case 'Cancelled': return 'bg-danger-color/20 text-danger-color';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Processing': return <FaBoxOpen className="mr-1" />;
      case 'Shipped': return <FaTruck className="mr-1" />;
      case 'Delivered': return <FaCheck className="mr-1" />;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-10">Loading orders...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (orders.length === 0) return <div className="text-center py-10">No orders found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.created_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900"
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
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold">Order {selectedOrder.id.substring(0, 8)}</h3>
                  <p className="text-sm text-gray-500">Placed on {selectedOrder.created_at}</p>
                </div>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                </span>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                <p className="text-sm">{selectedOrder.customer_email}</p>
                <p className="text-sm mt-2">{selectedOrder.shipping_address}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                {selectedOrder.items ? (
                  <div className="border rounded-md divide-y">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading items...</p>
                )}
              </div>
              
              <div className="flex justify-between text-sm font-medium mb-6">
                <span>Total</span>
                <span>£{selectedOrder.total.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Update Status</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Processing')}
                    className={`px-3 py-1 text-xs rounded-full border ${selectedOrder.status === 'Processing' ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-gray-50'}`}
                  >
                    Processing
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Shipped')}
                    className={`px-3 py-1 text-xs rounded-full border ${selectedOrder.status === 'Shipped' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                  >
                    Shipped
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Delivered')}
                    className={`px-3 py-1 text-xs rounded-full border ${selectedOrder.status === 'Delivered' ? 'bg-green-100 border-green-300' : 'hover:bg-gray-50'}`}
                  >
                    Delivered
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
