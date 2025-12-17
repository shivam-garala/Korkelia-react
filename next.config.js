const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_BASE_API_URL:
      process.env.NEXT_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BASE_API_URL,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BASE_API_URL ??
      process.env.NEXT_BASE_API_URL,
    NEXT_PUBLIC_BASE_API_URL:
      process.env.NEXT_PUBLIC_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_BASE_API_URL,
  },
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "src"),
    },
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "src"),
    };

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
