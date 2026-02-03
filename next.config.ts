/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**', // Esto permite cualquier archivo de cualquier bucket
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Por si sigues usando fotos de prueba
      }
    ],
  },
};

module.exports = nextConfig;