import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Disable turbopack to use webpack with polyfills
  // turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Polyfills for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url/'),
        // Ignore React Native modules (we're browser-only)
        '@react-native-async-storage/async-storage': false,
      };

      // Automatically inject polyfills where needed
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      // Ignore React Native modules (only used in RN, not browser)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@react-native-async-storage\/async-storage/,
          require.resolve('./scripts/empty-module.js')
        )
      );
    }
    return config;
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    // Allow larger chunks to be precached (3.5 MB instead of 2 MB default)
    maximumFileSizeToCacheInBytes: 3.5 * 1024 * 1024,
  },
})(nextConfig);
