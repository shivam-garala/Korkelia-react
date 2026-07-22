import { headers } from "next/headers";
import LabGrownDiamondRingSingaporeCollectionClient  from "./LabGrownDiamondRingSingaporeCollectionClient";
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
    "Lab Grown Diamond Rings Singapore | Korkeila",
  description:
    "Shop lab grown diamond rings. Sustainable luxury meets modern Nordic design at Korkeila Helsinki.",
  alternates: {
    canonical: "/collections/lab-grown-diamond-ring-singapore",
  },
};

export default async function LabGrownDiamondRingSingaporePage() {
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
      <LabGrownDiamondRingSingaporeCollectionClient />
    </>
  );
}
