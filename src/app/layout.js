import { cookies, headers } from "next/headers";
import "./globals.css";
import StoreProvider from "../providers/StoreProvider.jsx";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics.jsx";

const siteName = "Korkeila Helsinki";
const descriptions = {
  fi: "Tutustu Korkeila Helsinki ensiluokkaisiin käsintehtyihin koruihin — elegantteihin koruihin, jotka on suunniteltu ajattomaan kauneuteen ja moderniin elämäntyyliin.",
  en: "Explore premium handcrafted jewellery at Korkeila Helsinki — elegant designs crafted for timeless beauty and modern lifestyles.",
};

const DEFAULT_LANGUAGE = "fi";
const DEFAULT_SITE_URL = "https://uat.korkeilahelsinki.fi";
const SUPPORTED_LANGUAGES = new Set(["en", "fi"]);
const DEFAULT_OG_IMAGE = "/logo/logo_share.png";

const normalizeLanguage = (value) => {
  if (!value) return "";
  const normalized = String(value).toLowerCase();
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "";
};

const resolveLanguage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLanguage = normalizeLanguage(headerStore.get("x-site-lang"));
  const cookieLanguage = normalizeLanguage(cookieStore.get("siteLang")?.value);
  return headerLanguage || cookieLanguage || DEFAULT_LANGUAGE;
};

const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

export async function generateMetadata() {
  const language = await resolveLanguage();
  const baseUrl = await resolveBaseUrl();
  const description = descriptions[language] || descriptions.fi;

  return {
    metadataBase: new URL(baseUrl),
    title: siteName,
    description: description,
    icons: {
      icon: "/logo/logo.png",
      apple: "/logo/logo.png",
    },
    openGraph: {
      type: "website",
      url: baseUrl,
      title: siteName,
      siteName: siteName,
      description: description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: siteName,
        },
      ],
      locale: language === "fi" ? "fi_FI" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

const buildOrganizationJsonLd = (baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: siteName,
  legalName: "Korkeila Helsinki Oy",
  url: baseUrl,
  logo: `${baseUrl}/logo/logo.png`,
  image: `${baseUrl}/logo/logo.png`,
  telephone: "+358503270600",
  email: "korkeila@korkeilahelsinki.fi",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Korkeavuorenkatu 6",
    postalCode: "00150",
    addressLocality: "Helsinki",
    addressCountry: "FI",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "11:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "15:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com/korkeilahelsinki",
    "https://www.instagram.com/korkeilahelsinki/",
    "https://www.threads.com/@korkeilahelsinki",
  ],
});

export default async function RootLayout({ children }) {
  const language = await resolveLanguage();
  const baseUrl = await resolveBaseUrl();
  const organizationJsonLd = buildOrganizationJsonLd(baseUrl);

  return (
    <html lang={language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Nata+Sans:wght@300;400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <GoogleAnalytics />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
