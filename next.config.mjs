/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure API routes to handle large files
  experimental: {
    serverComponentsExternalPackages: ['multer'],
  },
  // Increase the maximum payload size for API routes
  async headers() {
    return [
      {
        source: '/api/helpers/:id/documents',
        headers: [
          {
            key: 'Content-Type',
            value: 'multipart/form-data',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

