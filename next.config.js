const path = require("path");
const redirectHomePaths = [
  "/pages/timantin-puhtausluokittelu",
  "/products/kukkasormus",
  "/pages/timantin-hiontamuodot",
  "/pages/timantin-vari",
  "/pages/jalometallit-ja-niiden-ominaisuudet",
  "/pages/tietoa-laboratoriossa-valmistetuista-timanteista",
  "/pages/karaattipaino-selitettyna",
  "/pages/timanttikorujen-huolto",
  "/pages/meidan-liike",
  "/pages/milloin-ja-miten-kosia",
  "/pages/timanttitietoutta",
  "/products/kopio-puoliallianssi-sormus-0-33ct-3",
  "/collections/frontpage",
  "/products/timanttikorvakorut",
  "/collections/sileat-kivettomat-sormukset",
  "/products/kopio-kapea-taysallianssisormus-briljanteilla-0-50ct",
];

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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d42za7xj4jbwi.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "d3s5kl2h1nwckf.cloudfront.net",
      },
    ],
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
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async redirects() {
    const isProduction = process.env.NODE_ENV === "production";
    return redirectHomePaths.map((source) => ({
      source,
      destination: "/",
      permanent: isProduction,
    }));
  },
};

module.exports = nextConfig;
