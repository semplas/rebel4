<<<<<<< HEAD
import React, { Suspense } from 'react';
import AdminContent from '@/components/admin/AdminContent';
=======
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaImage, FaUpload, FaSave, FaTachometerAlt, FaBox, FaImages, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Admin components
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Banners from './components/Banners';
import Orders from './components/Orders';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to prevent flashing
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Check authentication once when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Admin: User is authenticated');
          setIsAuthenticated(true);
        } else {
          console.log('Admin: User is not authenticated');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Admin auth check error:', error);
        // On error, keep user in authenticated state to prevent issues
        setIsAuthenticated(true);
      } finally {
        setAuthChecked(true);
        setLoading(false); // Set loading to false regardless of auth result
      }
    };
    
    checkAuth();
  }, []); // Empty dependency array ensures this runs only once
  
  // Handle sign out
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      window.location.href = '/'; // Redirect to home page after sign out
    }
  };
  
  // Set active tab from URL parameter if present
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    // Check if we should show add product form
    if (searchParams.get('addProduct') === 'true') {
      setShowAddProduct(true);
    }
  }, [searchParams]);
  
  // Add console logs to track state changes
  useEffect(() => {
    console.log('Admin page state:', { loading, isAuthenticated, authChecked });
  }, [loading, isAuthenticated, authChecked]);

  // Add a timeout to force loading to false after 5 seconds as a fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading state to false after timeout');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f

// Main page component with Suspense boundary
export default function AdminPage() {
  return (
<<<<<<< HEAD
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading admin page...</div>}>
      <AdminContent />
    </Suspense>
  );
}

// Export generateStaticParams to ensure this page is included in the static build
export function generateStaticParams() {
  return [];
=======
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-color"></div>
        </div>
      ) : !isAuthenticated && authChecked ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You must be logged in as an admin to view this page.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-accent-color text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <FaSignOutAlt className="mr-2" /> Sign Out
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <motion.div 
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="flex flex-wrap border-b border-gray-300 mb-8 gap-1"
          >
            <TabButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<FaTachometerAlt className="mr-2" />}
              label="Dashboard"
              dataTab="dashboard"
            />
            <TabButton 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')}
              icon={<FaBox className="mr-2" />}
              label="Products"
              dataTab="products"
            />
            <TabButton 
              active={activeTab === 'banners'} 
              onClick={() => setActiveTab('banners')}
              icon={<FaImages className="mr-2" />}
              label="Banners"
              dataTab="banners"
            />
            <TabButton 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')}
              icon={<FaShoppingCart className="mr-2" />}
              label="Orders"
              dataTab="orders"
            />
          </motion.div>
          
          {/* Content Sections */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard isAuthenticated={isAuthenticated} />}
            {activeTab === 'products' && <Products initialShowAddProduct={showAddProduct} isAuthenticated={isAuthenticated} />}
            {activeTab === 'banners' && <Banners isAuthenticated={isAuthenticated} />}
            {activeTab === 'orders' && <Orders isAuthenticated={isAuthenticated} />}
          </motion.div>
        </>
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label, dataTab }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 font-medium flex items-center transition-all ${
        active 
          ? 'border-b-2 border-accent-color text-accent-color' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
      data-tab={dataTab}
    >
      {icon}
      {label}
    </button>
  );
>>>>>>> 1688502464d45e43b35dd8a9fddab09204b1829f
}
