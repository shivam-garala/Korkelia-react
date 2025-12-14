import { Geist, Geist_Mono, Marcellus, Noto_Sans } from "next/font/google";
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

const nataSans = Noto_Sans({
  variable: "--font-nata-sans",
  subsets: ["latin"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Korkeila Helsinki",
  description: "Reference implementation for a data-driven, re-orientable navbar in Next.js.",
  icons: {
    icon: "/logo/logo.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nataSans.variable} ${marcellus.variable}`}
        suppressHydrationWarning
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
