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

// Always https — see robots.js for why the x-forwarded-proto header isn't trusted.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
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

export default async function RootLayout({ children }) {
  const language = await resolveLanguage();

  return (
    <html lang={language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Nata+Sans:wght@300;400;500;600;700&display=swap"
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
