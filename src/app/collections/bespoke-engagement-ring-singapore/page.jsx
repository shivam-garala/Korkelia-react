import { headers } from "next/headers";
import BespokeEngagementRringSingaporeCollectionClient  from "./BespokeEngagementRringSingaporeCollectionClient";
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
const matchesSubCategory = (label) => {
  const normalized = normalizeLabel(label);
  return (
    normalized.includes("halo") ||
    normalized.includes("solitaire") ||
    normalized.includes("3 stones") ||
    normalized.includes("alliance")
  );
};

export const metadata = {
  title:
    "Bespoke Engagement Rings Singapore | Korkeila",
  description:
    "Design a bespoke engagement ring with Korkeila Helsinki. Unique, handcrafted pieces tailored to your vision and values.",
};

export default async function BespokeEngagementRingSingaporePage() {
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
      <BespokeEngagementRringSingaporeCollectionClient />
    </>
  );
}
