/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/tsg',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
export default nextConfig;
