import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/#contact",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/cdn-frames/:path*",
        destination:
          "https://alinx.nyc3.cdn.digitaloceanspaces.com/frames/:path*",
      },
    ];
  },
};

export default nextConfig;
