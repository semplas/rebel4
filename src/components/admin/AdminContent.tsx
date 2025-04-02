'use client';

import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import Dashboard from '@/app/admin/components/Dashboard';
import Products from '@/app/admin/components/Products';
import Orders from '@/app/admin/components/Orders';
import Banners from '@/app/admin/components/Banners';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaChartLine, FaBoxOpen, FaShoppingCart, FaImages, FaUser } from 'react-icons/fa';

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userEmail, setUserEmail] = useState('');
  const supabase = createClientComponentClient();
  
  // Authentication logic
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Get user email if authenticated
      if (session?.user) {
        setUserEmail(session.user.email || '');
      }
      
      setIsLoading(false);
      
      // Set up auth state listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
          if (session?.user) {
            setUserEmail(session.user.email || '');
          } else {
            setUserEmail('');
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, [supabase.auth]);
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log('Starting logout process...');
      
      // Force client-side state update
      setIsAuthenticated(false);
      
      // Use the global scope to completely sign out from all devices
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn('Sign out API call had an error:', error);
      }
      
      // Clear any local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      
      // For older versions of Supabase
      const localStorageKeys = Object.keys(localStorage);
      const supabaseKeys = localStorageKeys.filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase')
      );
      
      supabaseKeys.forEach(key => {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      });
      
      // Clear cookies that might be persisting the session
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      console.log('Forced logout completed');
      
      // Redirect to login page with a cache-busting parameter
      window.location.href = '/admin?logout=' + new Date().getTime();
    } catch (err) {
      console.error('Unexpected error during forced logout:', err);
      window.location.href = '/admin?logout=' + new Date().getTime();
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-color">
        <div className="amazon-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-accent-color border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return (
    <div className="min-h-screen bg-background-color">
      <div className="bg-primary-color text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Awaknd Rebel Admin</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              <FaUser className="mr-2" />
              <span>{userEmail}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-accent-color text-black rounded hover:bg-[#F0AD4E] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="amazon-card p-4 sticky top-6">
              <nav className="space-y-1">
                <NavItem 
                  icon={<FaChartLine />} 
                  label="Dashboard" 
                  id="dashboard" 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
                <NavItem 
                  icon={<FaBoxOpen />} 
                  label="Products" 
                  id="products" 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
                <NavItem 
                  icon={<FaShoppingCart />} 
                  label="Orders" 
                  id="orders" 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
                <NavItem 
                  icon={<FaImages />} 
                  label="Banners" 
                  id="banners" 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'dashboard' && <Dashboard isAuthenticated={isAuthenticated} />}
            {activeTab === 'products' && <Products />}
            {activeTab === 'orders' && <Orders />}
            {activeTab === 'banners' && <Banners />}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, id, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-accent-color text-black' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
}
