/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize for Vercel deployment
    loader: 'default',
    formats: ['image/webp'],
  },
  // Minimal experimental features
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Disable font optimization to avoid Google Fonts issues
  optimizeFonts: false,
  // Minimal webpack configuration
  webpack: (config, { isServer }) => {
    // Handle sharp properly for Vercel
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('sharp')
    }
    
    return config
  }
}

module.exports = nextConfig
