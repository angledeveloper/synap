import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "3.109.207.37",
      },
      {
        protocol: "https",
        hostname: "dashboard.synapseaglobal.com",
      },
    ],
  },
};

export default nextConfig;
