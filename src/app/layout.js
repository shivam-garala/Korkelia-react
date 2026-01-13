import { Geist, Geist_Mono, Marcellus, Nata_Sans } from "next/font/google";
import { cookies } from "next/headers";
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

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("siteLang")?.value || "fi";
  const description = descriptions[language] || descriptions.fi;

  return {
    title: "Korkeila Helsinki",
    description: description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const language = cookieStore.get("siteLang")?.value || "fi";

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
