/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    asyncWebAssembly: true,
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

module.exports = nextConfig; 