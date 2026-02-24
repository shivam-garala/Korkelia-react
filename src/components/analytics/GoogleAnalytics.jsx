"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import Cookies from "js-cookie";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_COOKIE = "cookieConsent";

const hasAnalyticsConsent = () => {
  try {
    const data = JSON.parse(Cookies.get(CONSENT_COOKIE) || "{}");
    if (data.choice === "accepted") return true;
    return Boolean(data.analytics || data.marketing);
  } catch {
    return false;
  }
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(Boolean(GA_ID) && hasAnalyticsConsent());
    const handler = () => setEnabled(Boolean(GA_ID) && hasAnalyticsConsent());
    window.addEventListener("cookieConsentUpdated", handler);
    return () => window.removeEventListener("cookieConsentUpdated", handler);
  }, []);

  const pagePath = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
    });
  }, [enabled, pagePath]);

  if (!enabled || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
