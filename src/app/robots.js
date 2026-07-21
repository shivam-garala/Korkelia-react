import { headers } from "next/headers";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";

const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
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
