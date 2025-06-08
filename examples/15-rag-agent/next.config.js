/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs-node'],
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    
    // 对于服务器端，完全排除TensorFlow相关模块
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
      });
    }
    
    // 忽略TensorFlow相关的HTML和其他非JS文件
    config.module.rules.push({
      test: /\.html$/,
      use: 'ignore-loader',
    });
    
    // 添加fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 