/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/pink-ace-gto' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
