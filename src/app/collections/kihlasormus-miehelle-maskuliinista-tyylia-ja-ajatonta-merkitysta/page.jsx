import KihlasormusMiehelleCollectionClient from "./KihlasormusMiehelleCollectionClient.jsx";
import { resolveApiBaseUrl } from "../../../lib/productDefaultVariant.js";
import { buildItemListJsonLd, fetchCollectionItemListProducts } from "../../../lib/collectionItemList.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "kihlasormus-miehelle-maskuliinista-tyylia-ja-ajatonta-merkitysta";
const PAGE_NAME = "Kihlasormus miehelle";
const CATEGORY_ID = "1";

const normalizeLabel = (value) => String(value ?? "").trim().toLowerCase();
const matchesSubCategory = (label) => {
  const normalized = normalizeLabel(label).replace(/’/g, "'");
  return (
    normalized.includes("men's rings") ||
    normalized.includes("mens rings") ||
    normalized.includes("men rings") ||
    normalized.includes("men's ring") ||
    normalized.includes("mens ring")
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
  title:
    "Kihlasormus Miehelle – maskuliinista tyyliä ja ajatonta merkitystä – Korkeila Helsinki",
  description:
    "Kihlasormus miehelle ei ole vain koru – se on lupaus, sitoumus ja osa tärkeää elämänvaihetta. Korkeila Helsingillä suunnittelemme ja valmistamme miesten kihlasormukset käsityönä, yksilöllisesti ja laadukkaista materiaaleista. Valikoimastamme löydät ajattoman tyylikkäitä vaihtoehtoja miehille, jotka arvostavat huolitelt",
};

export default async function KihlasormusMiehelleCollectionPage() {
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
      <KihlasormusMiehelleCollectionClient />
    </>
  );
}
