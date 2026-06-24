import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/download",
        destination: "/order#install",
        permanent: false,
      },
      {
        source: "/mini-program",
        destination: "/order#wechat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
