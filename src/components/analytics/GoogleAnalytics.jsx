"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import Cookies from "js-cookie";
import { DEFAULT_CONSENT_STATE, readStoredConsent } from "../../lib/cookieConsent.js";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_COOKIE = "cookieConsent";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subscribeToConsent = (callback) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("cookieConsentUpdated", callback);
    return () => window.removeEventListener("cookieConsentUpdated", callback);
  };

  const getClientConsent = () => {
    try {
      const legacy = Cookies.get(CONSENT_COOKIE);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return { exists: true, state: readStoredConsent().state ?? parsed };
      }
    } catch {
      // Ignore parse errors and fall back to helper
    }
    return readStoredConsent();
  };

  const getServerConsent = () => ({ exists: true, state: { ...DEFAULT_CONSENT_STATE } });

  const consent = useSyncExternalStore(subscribeToConsent, getClientConsent, getServerConsent);
  const enabled = Boolean(GA_ID) && Boolean(consent.state.analytics);

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
