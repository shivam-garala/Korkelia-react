import { headers } from "next/headers";
import LabgrownDiamondSingaporeCollectionClient  from "./LabgrownDiamondSingaporeCollectionClient";
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
    "Lab Grown Diamonds Singapore | Korkeila Helsinki",
  description:
    "Shop lab grown diamonds. Sustainable, conflict-free brilliance with exceptional quality from Korkeila Helsinki.",
  alternates: {
    canonical: "/collections/Lab-grown-diamonds-Singapore",
  },
};

export default async function LabgrownDiamondSingaporePage() {
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
      <LabgrownDiamondSingaporeCollectionClient />
    </>
  );
}
