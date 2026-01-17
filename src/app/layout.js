import { Geist, Geist_Mono, Marcellus, Nata_Sans } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import StoreProvider from "../providers/StoreProvider.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nataSans = Nata_Sans({
  variable: "--font-nata-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  adjustFontFallback: false,
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

const descriptions = {
  fi: "Tutustu Korkeila Helsinki ensiluokkaisiin käsintehtyihin koruihin — elegantteihin koruihin, jotka on suunniteltu ajattomaan kauneuteen ja moderniin elämäntyyliin.",
  en: "Explore premium handcrafted jewellery at Korkeila Helsinki — elegant designs crafted for timeless beauty and modern lifestyles.",
};

const DEFAULT_LANGUAGE = "fi";
const SUPPORTED_LANGUAGES = new Set(["en", "fi"]);

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

export async function generateMetadata() {
  const language = await resolveLanguage();
  const description = descriptions[language] || descriptions.fi;

  return {
    title: "Korkeila Helsinki",
    description: description,
    icons: {
      icon: "/favicon_icon.ico",
    },
  };
}

export default async function RootLayout({ children }) {
  const language = await resolveLanguage();

  return (
    <html lang={language}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nataSans.variable} ${marcellus.variable}`}
        suppressHydrationWarning
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
