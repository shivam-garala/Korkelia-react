import { headers } from "next/headers";
import WeddingBandSingaporeCollectionClient  from "./weddingBandSingaporeCollectionClient";
import { resolveApiBaseUrl } from "../../../lib/productDefaultVariant.js";
import { buildItemListJsonLd, fetchCollectionItemListProducts } from "../../../lib/collectionItemList.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const CATEGORY_ID = "1";

// Always https — see robots.js for why the x-forwarded-proto header isn't trusted.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

const normalizeLabel = (value) => String(value ?? "").trim().toLowerCase();
const matchesSubCategory = (label) => normalizeLabel(label).includes("wedding band");

export const metadata = {
  title:
    "Wedding Bands Singapore | Korkeila Helsinki",
  description:
    "Explore wedding bands crafted with precision and care. Elegant Nordic designs made for lasting love by Korkeila Helsinki.",
};

export default async function WeddingBandSingaporePage() {
  const baseUrl = await resolveBaseUrl();
  const products = await fetchCollectionItemListProducts({
    apiBaseUrl: resolveApiBaseUrl(),
    siteBaseUrl: baseUrl,
    categoryId: CATEGORY_ID,
    languageId: "1",
    matchesSubCategory,
  });
  const itemListJsonLd = buildItemListJsonLd(products);

  return (
    <>
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <WeddingBandSingaporeCollectionClient />
    </>
  );
}
