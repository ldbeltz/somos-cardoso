import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const api = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8080";
    return [
      { source: "/api/v1/:path*", destination: api + "/api/v1/:path*" },
      { source: "/oauth2/:path*", destination: api + "/oauth2/:path*" },
      { source: "/login/oauth2/:path*", destination: api + "/login/oauth2/:path*" },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
