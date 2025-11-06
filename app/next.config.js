/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Allow build to complete with ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow build to complete with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig