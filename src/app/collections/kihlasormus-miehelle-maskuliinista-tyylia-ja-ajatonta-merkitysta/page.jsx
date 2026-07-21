import { headers } from "next/headers";
import KihlasormusMiehelleCollectionClient from "./KihlasormusMiehelleCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "kihlasormus-miehelle-maskuliinista-tyylia-ja-ajatonta-merkitysta";
const PAGE_NAME = "Kihlasormus miehelle";

const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

export const metadata = {
  title:
    "Kihlasormus Miehelle – maskuliinista tyyliä ja ajatonta merkitystä – Korkeila Helsinki",
  description:
    "Kihlasormus miehelle ei ole vain koru – se on lupaus, sitoumus ja osa tärkeää elämänvaihetta. Korkeila Helsingillä suunnittelemme ja valmistamme miesten kihlasormukset käsityönä, yksilöllisesti ja laadukkaista materiaaleista. Valikoimastamme löydät ajattoman tyylikkäitä vaihtoehtoja miehille, jotka arvostavat huolitelt",
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <KihlasormusMiehelleCollectionClient />
    </>
  );
}
