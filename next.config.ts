import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export
  output: "export",
  // Set the output directory to 'out' instead of '.next'
  distDir: "out",
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
  // Ensure proper path resolution on cPanel
  basePath: "",
  trailingSlash: true,
  
  // These options have been moved out of experimental in Next.js 15
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Add exportPathMap for dynamic routes
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/shop/product/1': { page: '/shop/product/[id]', query: { id: '1' } },
      '/shop/product/2': { page: '/shop/product/[id]', query: { id: '2' } },
      '/shop/product/3': { page: '/shop/product/[id]', query: { id: '3' } },
      '/shop/product/4': { page: '/shop/product/[id]', query: { id: '4' } },
      '/shop/product/5': { page: '/shop/product/[id]', query: { id: '5' } },
      // Add more dynamic routes as needed
    };
  }
}

export default nextConfig;
