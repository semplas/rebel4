'use client';

import { useState } from 'react';
import { FaPlus, FaImage, FaUpload, FaChartLine, FaShoppingBag, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Dashboard() {
  // Sample data for dashboard
  const products = [
    { id: 1, name: "Classic Oxford", price: 120, sold: 24, image: "/images/1.png" },
    { id: 2, name: "Leather Loafers", price: 95, sold: 18, image: "/images/1.png" },
    { id: 3, name: "Suede Chelsea Boots", price: 150, sold: 12, image: "/images/1.png" },
  ];
  
  // Recent orders data
  const recentOrders = [
    { id: "ORD-1234", customer: "John Smith", date: "2023-10-15", total: 215, status: "Processing" },
    { id: "ORD-1235", customer: "Emma Johnson", date: "2023-10-14", total: 150, status: "Shipped" },
  ];

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
          value={products.length} 
          change="+3 this week" 
          icon={<FaShoppingBag className="text-indigo-500" />} 
        />
        <StatsCard 
          title="Orders" 
          value={12} 
          change="+2 today" 
          icon={<FaShoppingBag className="text-green-500" />} 
        />
        <StatsCard 
          title="Revenue" 
          value="£2,450" 
          change="+15% this month" 
          icon={<FaMoneyBillWave className="text-emerald-500" />} 
        />
        <StatsCard 
          title="Customers" 
          value={48} 
          change="+5 this week" 
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
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <ActionButton 
              primary
              icon={<FaPlus className="mr-2" />}
              label="Add New Product"
              onClick={() => window.location.href = '#products'}
            />
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
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                    <td className="px-4 py-3 text-sm">£{order.total}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
          <ul className="space-y-4">
            {products.sort((a, b) => (b.sold || 0) - (a.sold || 0)).map(product => (
              <li key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                  <FaShoppingBag className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">£{product.price}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium">{product.sold}</span>
                  <p className="text-xs text-gray-500">units sold</p>
                </div>
              </li>
            ))}
          </ul>
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

// Stats Card Component
function StatsCard({ title, value, change, icon }) {
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
          <p className="text-3xl font-bold mt-1">{value}</p>
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
