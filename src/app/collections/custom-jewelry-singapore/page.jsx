import { headers } from "next/headers";
import CustomJewelrySingaporeCollectionClient  from "./CustomJewelrySingaporeCollectionClient";
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
    "Custom Jewelry Singapore | Korkeila Helsinki",
  description:
    "Create custom jewelry with Korkeila Helsinki. Tailored pieces designed with care, ethical sourcing, and refined craftsmanship.",
};

export default async function CustomJewelrySingaporePage() {
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
      <CustomJewelrySingaporeCollectionClient />
    </>
  );
}
