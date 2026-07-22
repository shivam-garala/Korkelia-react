import { headers } from "next/headers";
import BespokeJewelrySingaporeCollectionClient  from "./BespokeJewelrySingaporeCollectionClient";
import { resolveApiBaseUrl } from "../../../lib/productDefaultVariant.js";
import { buildItemListJsonLd, fetchAllCategoriesItemListProducts } from "../../../lib/collectionItemList.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";

// Always https — see robots.js for why the x-forwarded-proto header isn't trusted.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

export const metadata = {
  title:
    "Bespoke Jewelry Singapore | Korkeila Helsinki",
  description:
    "Discover bespoke jewelry by Korkeila Helsinki. Personalized designs crafted with precision, sustainability, and timeless Nordic style.",
  alternates: {
    canonical: "/collections/bespoke-jewelry-singapore",
  },
};

export default async function BespokeJewelrySingaporePage() {
  const baseUrl = await resolveBaseUrl();
  const products = await fetchAllCategoriesItemListProducts({
    apiBaseUrl: resolveApiBaseUrl(),
    siteBaseUrl: baseUrl,
    languageId: "1",
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
      <BespokeJewelrySingaporeCollectionClient />
    </>
  );
}
