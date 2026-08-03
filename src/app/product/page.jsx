import { Suspense } from "react";
import { headers } from "next/headers";
import ProductListingClient from "./ProductListingClient.jsx";
import { resolveApiBaseUrl } from "../../lib/productDefaultVariant.js";
import {
  buildItemListJsonLd,
  fetchCategoryItemListProducts,
  resolveListingCategoryId,
} from "../../lib/collectionItemList.js";

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
  alternates: {
    canonical: "/product",
  },
};

export default async function ProductListingPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categoryIdParam = resolvedSearchParams?.category_id;
  const categoryNameParam = resolvedSearchParams?.category_name;

  const baseUrl = await resolveBaseUrl();
  const apiBaseUrl = resolveApiBaseUrl();
  const categoryId = await resolveListingCategoryId({
    apiBaseUrl,
    categoryId: Array.isArray(categoryIdParam) ? categoryIdParam[0] : categoryIdParam,
    categoryName: Array.isArray(categoryNameParam) ? categoryNameParam[0] : categoryNameParam,
  });
  const products = await fetchCategoryItemListProducts({
    apiBaseUrl,
    siteBaseUrl: baseUrl,
    categoryId,
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
      <Suspense fallback={null}>
        <ProductListingClient />
      </Suspense>
    </>
  );
}
