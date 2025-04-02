import type { NextConfig } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the static export setting
  // output: process.env.NODE_ENV === 'production' ? "export" : undefined,
  
  // Keep standard Next.js output
  distDir: ".next",
  
  // These settings help with cPanel compatibility
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  images: {
    domains: ["placehold.co", "lnnrzyefherqaftvqomt.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "https",
        hostname: "lnnrzyefherqaftvqomt.supabase.co"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
