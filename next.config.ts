import type { NextConfig } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adding a comment to test Augment

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export in production
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
  
  // Remove exportPathMap as it's not compatible with App Router
};

module.exports = nextConfig;
