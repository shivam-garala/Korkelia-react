import { headers } from "next/headers";
import KultainenKihlasormusCollectionClient from "./KultainenKihlasormusCollectionClient.jsx";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";
const PAGE_SLUG = "kultainen-kihlasormus-ajaton-symboli-rakkaudelle";
const PAGE_NAME = "Kultainen kihlasormus";

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
    "Kultainen Kihlasormus – Ajaton Symboli Rakkaudelle – Korkeila Helsinki",
  description:
    "Kultainen Kihlasormus -Tyylikäs ja kestävä valinta, joka hehkuu lämpöä ja kertoo ainutlaatuisen tarinan rakkaudesta sekä yhteisestä matkasta sukupolvien yli.",
  alternates: {
    canonical: `/collections/${PAGE_SLUG}`,
  },
};

export default async function KultainenKihlasormusCollectionPage() {
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
      <KultainenKihlasormusCollectionClient />
    </>
  );
}
