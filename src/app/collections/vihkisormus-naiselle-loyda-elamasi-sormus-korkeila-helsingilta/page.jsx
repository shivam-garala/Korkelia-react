import { headers } from "next/headers";
import VihkisormusCollectionClient from "./VihkisormusCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "vihkisormus-naiselle-loyda-elamasi-sormus-korkeila-helsingilta";
const PAGE_NAME = "Vihkisormus naiselle";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <VihkisormusCollectionClient />
    </>
  );
}


