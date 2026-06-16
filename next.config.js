/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.0.201",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;