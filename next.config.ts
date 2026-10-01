import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", port: "" },
      { protocol: "https", hostname: "assets.vercel.com", port: "" },
      { protocol: "https", hostname: "cdn.jsdelivr.net", port: "" },
      { protocol: "http", hostname: "localhost", port: "" },
    ],
  },
};

export default nextConfig;
