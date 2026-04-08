/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
    ],
  },
  experimental: {
    // pdf-parse and mammoth use Node.js native modules — must not be bundled by webpack
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
}

export default nextConfig
