import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 10 MB payloads in Server Actions (default is 1 MB)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
