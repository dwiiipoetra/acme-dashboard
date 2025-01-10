import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Menonaktifkan pemeriksaan linting di Next.js
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
