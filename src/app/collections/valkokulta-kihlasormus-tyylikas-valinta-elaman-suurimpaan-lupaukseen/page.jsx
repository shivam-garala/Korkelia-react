import { headers } from "next/headers";
import ValkokultaKihlasormusCollectionClient from "./ValkokultaKihlasormusCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "valkokulta-kihlasormus-tyylikas-valinta-elaman-suurimpaan-lupaukseen";
const PAGE_NAME = "Valkokulta kihlasormus";

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
    "Valkokulta Kihlasormus – Elegantit mallit ja vinkit täydelliseen valintaan – Korkeila Helsinki",
  description:
    "Tutustu tyylikkäisiin malleihin ja asiantunteviin neuvoihin, joiden avulla löydät juuri oikean sormuksen ikimuistoiseen hetkeen.",
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
};

export default async function ValkokultaKihlasormusCollectionPage() {
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
      <ValkokultaKihlasormusCollectionClient />
    </>
  );
}
