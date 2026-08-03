import { headers } from "next/headers";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";

// Always https — the reverse proxy's x-forwarded-proto header has been seen
// reporting "http" even for genuine HTTPS requests, which corrupted every
// canonical/hreflang/sitemap URL sitewide. This app is never legitimately
// served over plain HTTP, so we no longer trust that header for scheme.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

export default async function robots() {
  const baseUrl = await resolveBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/login", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
