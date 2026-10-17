import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Add this line

  /* Keep your existing configuration */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;