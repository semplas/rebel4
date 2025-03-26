import type { NextConfig } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback IDs in case of database error
const fallbackIds = ['1', '2', '3', '4', '5', '40e1f01f-c321-45b5-8e36-638c6f7e34f9'];

const nextConfig: NextConfig = {
  // Enable static export only in production
  output: process.env.NODE_ENV === 'production' ? "export" : undefined,
  // Set the output directory to 'out' instead of '.next'
  distDir: process.env.NODE_ENV === 'production' ? "out" : ".next",
  images: {
    unoptimized: true,
    domains: ["placehold.co", "lnnrzyefherqaftvqomt.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "https",
        hostname: "lnnrzyefherqaftvqomt.supabase.co"
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Define all routes that should be generated at build time
  async exportPathMap() {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return { '/': { page: '/' } };
    }
    
    const paths = {
      '/': { page: '/' },
      '/shop': { page: '/shop' }
      // Add other static routes here
    };
    
    try {
      // Fetch all product IDs from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('id');
        
      if (error) {
        console.error('Error fetching product IDs for exportPathMap:', error);
        // Add fallback product routes
        fallbackIds.forEach(id => {
          paths[`/shop/product/${id}`] = { 
            page: '/shop/product/[id]', 
            query: { id } 
          };
        });
      } else if (data && data.length > 0) {
        // Add dynamic product routes
        data.forEach(product => {
          const id = product.id.toString();
          paths[`/shop/product/${id}`] = { 
            page: '/shop/product/[id]', 
            query: { id } 
          };
        });
      } else {
        // No products found, use fallback IDs
        fallbackIds.forEach(id => {
          paths[`/shop/product/${id}`] = { 
            page: '/shop/product/[id]', 
            query: { id } 
          };
        });
      }
    } catch (err) {
      console.error('Failed to generate exportPathMap:', err);
      // Add fallback product routes
      fallbackIds.forEach(id => {
        paths[`/shop/product/${id}`] = { 
          page: '/shop/product/[id]', 
          query: { id } 
        };
      });
    }
    
    return paths;
  }
};

export default nextConfig;
