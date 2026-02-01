/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
     {
      protocol: 'https',
      hostname: 'picsum.photos', // Solo el dominio
    },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Clave para cuando subas tus propias fotos
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // Clave para cuando subas tus propias fotos
      },
      {
        protocol: 'https',
        hostname: 'www.adobe.com', // Clave para cuando subas tus propias fotos
      },
    ],
  },
};

module.exports = nextConfig;