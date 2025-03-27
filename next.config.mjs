/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure route handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '2mb'
    }
  },
  // Turn off optimizations
  optimizeFonts: false,
  swcMinify: false,
  compress: false,
  // Skip type checking
  typescript: {
    ignoreBuildErrors: true
  },
  // Standalone output
  output: 'standalone'
};

export default nextConfig;
