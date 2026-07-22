import TimanttisormusCollectionClient from "./TimanttisormusCollectionClient.jsx";
import { resolveApiBaseUrl } from "../../../lib/productDefaultVariant.js";
import { buildItemListJsonLd, fetchCollectionItemListProducts } from "../../../lib/collectionItemList.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "timanttisormus-ajaton-valinta-elaman-tarkeimpiin-hetkiin";
const PAGE_NAME = "Timanttisormus";
const CATEGORY_ID = "1";

const normalizeLabel = (value) => String(value ?? "").trim().toLowerCase();
const isThreeStone = (value) =>
  /(^|\b)3\s*-?\s*stones?\b/.test(value) ||
  value.includes("three stone") ||
  value.includes("three-stone") ||
  value.includes("three stones") ||
  value.includes("three-stones");
const matchesSubCategory = (label) => {
  const normalized = normalizeLabel(label);
  return (
    normalized.includes("solitaire") ||
    normalized.includes("halo") ||
    normalized.includes("alliance") ||
    isThreeStone(normalized)
  );
};

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
  title: "Timanttisormus | Upeat mallit, hohto ja vinkit täydelliseen valintaan – Korkeila Helsinki",
  description:
    "Inspiroidu kauniista malleista ja löydä vinkit, joiden avulla valitset juuri sinulle sopivan sormuksen tärkeisiin hetkiin ja arjen eleganssiin.",
};

export default async function TimanttisormusCollectionPage() {
  const baseUrl = await resolveBaseUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Etusivu", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: PAGE_NAME, item: `${baseUrl}/collections/${PAGE_SLUG}` },
    ],
  };

  const products = await fetchCollectionItemListProducts({
    apiBaseUrl: resolveApiBaseUrl(),
    siteBaseUrl: baseUrl,
    categoryId: CATEGORY_ID,
    matchesSubCategory,
  });
  const itemListJsonLd = buildItemListJsonLd(products);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <TimanttisormusCollectionClient />
    </>
  );
}
