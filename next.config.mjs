// next.config.mjs

const nextConfig = {
  experimental: {
    serverActions: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_DOMAIN,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prevent canvas module from being bundled
    if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
        canvas: false,
      fs: false,
        path: false,
    };
  }
    return config;
  },
};

export default nextConfig;
