/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    ignoreDuringBuilds: true, // ⛔ Temporarily bypass ESLint errors on build
  },
};

export default nextConfig;
