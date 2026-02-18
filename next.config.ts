/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Probamos con esta configuración que es la que Next.js 14/15 
    // requiere para túneles como ngrok
    serverActions: {
      bodySizeLimit: '50mb', // Aumentamos el límite a 50MB para soportar videos y fotos pesadas
      allowedOrigins: [
        "2590-2803-9800-b802-81b2-3596-f3c1-55e4-f2bb.ngrok-free.app"
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },

    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;