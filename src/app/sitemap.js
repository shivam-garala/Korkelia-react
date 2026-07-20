import { headers } from "next/headers";
import {
  buildVariantQuery,
  pickCheapestPerProduct,
  resolveApiBaseUrl,
} from "../lib/productDefaultVariant.js";

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

// Next.js's sitemap serializer does not XML-escape the `url` field itself,
// so raw "&" in query strings (e.g. ?design_id=1&metal_id=2) breaks the XML.
const escapeXmlUrl = (url) => url.replace(/&/g, "&amp;");

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/appointment", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/diamond-guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/diamond-difference", changeFrequency: "monthly", priority: 0.6 },
  { path: "/custom-jewelry", changeFrequency: "monthly", priority: 0.6 },
  { path: "/product", changeFrequency: "daily", priority: 0.7 },
  { path: "/shipping-returns", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.3 },
];

const COLLECTION_SLUGS = [
  "timanttisormus-ajaton-valinta-elaman-tarkeimpiin-hetkiin",
  "kihlasormus-naiselle-loyda-juuri-sinulle-taydellinen-sormus",
  "kihlasormus-miehelle-maskuliinista-tyylia-ja-ajatonta-merkitysta",
  "valkokulta-kihlasormus-tyylikas-valinta-elaman-suurimpaan-lupaukseen",
  "vihkisormus-naiselle-loyda-elamasi-sormus-korkeila-helsingilta",
  "kultainen-kihlasormus-ajaton-symboli-rakkaudelle",
  "Engagement-Ring-Singapore",
  "Lab-grown-diamonds-Singapore",
  "Wedding-Band-Singapore",
  "bespoke-engagement-ring-singapore",
  "bespoke-jewelry-singapore",
  "custom-engagement-ring-singapore",
  "custom-jewelry-singapore",
  "lab-grown-diamond-ring-singapore",
];

const fetchProductEntries = async (baseUrl) => {
  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) return [];

  try {
    const categoriesResponse = await fetch(
      `${apiBaseUrl}/api/categoryMaster/home-page?language_id=1`,
      { cache: "no-store" }
    );
    if (!categoriesResponse.ok) return [];
    const categoriesJson = await categoriesResponse.json();
    const categories = Array.isArray(categoriesJson?.data) ? categoriesJson.data : [];

    const productUrls = new Set();

    await Promise.all(
      categories.map(async (category) => {
        const categoryId = category?.id;
        if (!categoryId) return;
        try {
          const params = new URLSearchParams({
            language_id: "1",
            category_id: String(categoryId),
            currency: "EU",
            currency_symbol: "€",
            prefer_white: "0",
          });
          const response = await fetch(
            `${apiBaseUrl}/api/product/listEcom?${params.toString()}`,
            { cache: "no-store" }
          );
          if (!response.ok) return;
          const json = await response.json();
          const list = Array.isArray(json) ? json : json?.data ?? [];

          // One entry per product — the cheapest variant — matching the
          // same selection product/[id]/page.jsx uses for its canonical tag.
          pickCheapestPerProduct(list).forEach((item, id) => {
            const queryString = buildVariantQuery(item).toString();
            const path = queryString ? `/product/${id}?${queryString}` : `/product/${id}`;
            productUrls.add(path);
          });
        } catch {
          // One category failing shouldn't drop the others.
        }
      })
    );

    const lastModified = new Date();
    return Array.from(productUrls).map((path) => ({
      url: escapeXmlUrl(`${baseUrl}${path}`),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // API unreachable — sitemap still returns static + collection pages.
    return [];
  }
};

export default async function sitemap() {
  const baseUrl = await resolveBaseUrl();
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const collectionEntries = COLLECTION_SLUGS.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productEntries = await fetchProductEntries(baseUrl);

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
