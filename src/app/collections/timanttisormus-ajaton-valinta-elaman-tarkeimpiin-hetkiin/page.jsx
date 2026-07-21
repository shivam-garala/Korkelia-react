import { headers } from "next/headers";
import TimanttisormusCollectionClient from "./TimanttisormusCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "timanttisormus-ajaton-valinta-elaman-tarkeimpiin-hetkiin";
const PAGE_NAME = "Timanttisormus";

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
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TimanttisormusCollectionClient />
    </>
  );
}
