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
  // Fix build trace collection issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Disable problematic optimizations for Vercel
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // Webpack configuration to handle circular dependencies
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for Vercel build issues
    config.externals = config.externals || []
    
    // Handle sharp properly for Vercel
    if (isServer) {
      config.externals.push('sharp')
    }
    
    // Prevent circular dependency issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent multiple instances of React
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    }
    
    // Optimize for production builds
    if (!dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    
    // Reduce bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
  // Output configuration for better Vercel compatibility
  output: 'standalone',
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
