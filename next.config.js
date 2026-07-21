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
  "/collections/sormukset",
  "/products/kopio-kihlasormus-3mm-bombe-court-premium",
  "/products/kopio-kihlasormus-3mm-bombe-court",
  "/pages/nain-tilaat-verkkokaupasta",
  "/products/kopio-kopio-puoliallianssi-sormus-0-33ct",
  "/products/kopio-briljantti-hiontainen-halosormus-yht-0-35ct",
  "/pages/ota-yhteytta",
  "/pages/tilaustyopalvelu",
  "/products/kopio-kihlasormus-4mm-bombe-court-premium",
  "/products/kopio-puoliallianssi-sormus-0-33ct-1",
  "/products/sun-matt-kihlasormus-5-mm",
  "/products/criss-cross-kihlasormus-4-5mm",
  "/products/ice-matt-kihlasormus-4-5-mm-1",
  "/pages/tilaustyot",
  "/pages/koru-opas",
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
      {
      protocol: "https",
      hostname: "imagesweb2026.s3.eu-north-1.amazonaws.com",
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
    return [
      ...redirectHomePaths.map((source) => ({
        source,
        destination: "/",
        permanent: isProduction,
      })),
    ];
  },
};

module.exports = nextConfig;
