import { headers } from "next/headers";
import VihkisormusCollectionClient from "./VihkisormusCollectionClient.jsx";
import { resolveApiBaseUrl } from "../../../lib/productDefaultVariant.js";
import { buildItemListJsonLd, fetchCollectionItemListProducts } from "../../../lib/collectionItemList.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "vihkisormus-naiselle-loyda-elamasi-sormus-korkeila-helsingilta";
const PAGE_NAME = "Vihkisormus naiselle";
const CATEGORY_ID = "1";

const normalizeLabel = (value) => String(value ?? "").trim().toLowerCase();
const isThreeStone = (value) =>
  /(^|\b)3\s*-?\s*stone\b/.test(value) ||
  value.includes("three stone") ||
  value.includes("three-stone");
const matchesSubCategory = (label) => {
  const normalized = normalizeLabel(label);
  return (
    normalized.includes("solitaire") ||
    normalized.includes("halo") ||
    normalized.includes("alliance") ||
    normalized.includes("allianssi") ||
    isThreeStone(normalized)
  );
};
// Mirrors the client's extra narrowing step: if an alliance/allianssi option
// exists among the matched sub-categories, show only that one; otherwise
// show every matched sub-category.
const pickSubCategoryIds = (options) => {
  const allianceOption = options.find((option) => {
    const label = normalizeLabel(option?.label);
    return label.includes("alliance") || label.includes("allianssi");
  });
  return allianceOption ? [String(allianceOption.value)] : options.map((option) => option.value);
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
  title:
    "Vihkisormus Naiselle – Täydellinen muotoilu ja vinkkejä – Korkeila Helsinki",
  description:
    "Löydä kauneimmat mallit ja asiantuntevat vinkit, jotka auttavat sinua valitsemaan täydellisen sormuksen elämän tärkeimpään juhlapäivään.",
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
};

export default async function VihkisormusCollectionPage() {
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
    pickSubCategoryIds,
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
      <VihkisormusCollectionClient />
    </>
  );
}


