import { headers } from "next/headers";
import KihlasormusCollectionClient from "./KihlasormusCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "kihlasormus-naiselle-loyda-juuri-sinulle-taydellinen-sormus";
const PAGE_NAME = "Kihlasormus naiselle";

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
  title: "Kihlasormus Naiselle – Tyylikästä muotoilua ja täydellinen valinta – Korkeila Helsinki",
  description:
    "Tutustu upeisiin malleihin ja hyödyllisiiin vinkkeihin, joiden avulla löydät juuri oikean sormuksen tärkeään hetkeen ja kestävään rakkauteen.",
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
};

export default async function KihlasormusCollectionPage() {
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
      <KihlasormusCollectionClient />
    </>
  );
}
