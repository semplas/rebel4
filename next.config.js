/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Your other configurations...
}

export default nextConfig;
