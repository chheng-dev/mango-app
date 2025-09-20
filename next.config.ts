import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'pg-native'],
  webpack: (config, { isServer }) => {
    // Exclude database-related modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Ignore pg-native and other problematic modules
    config.externals = config.externals || [];
    config.externals.push('pg-native');

    return config;
  },
};

export default nextConfig;
