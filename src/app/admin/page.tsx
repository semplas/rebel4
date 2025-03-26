'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaUpload, FaSave, FaTachometerAlt, FaBox, FaImages, FaShoppingCart } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Admin components
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Banners from './components/Banners';
import Orders from './components/Orders';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your products, banners, and orders</p>
      </motion.div>
      
      {/* Navigation Tabs */}
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-wrap border-b mb-8 gap-1"
      >
        <TabButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<FaTachometerAlt className="mr-2" />}
          label="Dashboard"
        />
        <TabButton 
          active={activeTab === 'products'} 
          onClick={() => setActiveTab('products')}
          icon={<FaBox className="mr-2" />}
          label="Products"
        />
        <TabButton 
          active={activeTab === 'banners'} 
          onClick={() => setActiveTab('banners')}
          icon={<FaImages className="mr-2" />}
          label="Banners"
        />
        <TabButton 
          active={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')}
          icon={<FaShoppingCart className="mr-2" />}
          label="Orders"
        />
      </motion.div>
      
      {/* Content Sections */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'banners' && <Banners />}
        {activeTab === 'orders' && <Orders />}
      </motion.div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 font-medium flex items-center transition-all ${
        active 
          ? 'border-b-2 border-black text-black' 
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
