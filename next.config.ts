import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization works on Netlify with the plugin
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Increase function body size for proxy streaming
  serverExternalPackages: [],
  experimental: {
    // Enable streaming for long-running serverless functions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
