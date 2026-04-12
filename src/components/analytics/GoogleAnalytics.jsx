"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  DEFAULT_CONSENT_STATE,
  clearAnalyticsCookies,
  getConsentSnapshot,
  subscribeConsent,
} from "../../lib/cookieConsent.js";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
// Keep a stable server snapshot reference; recreating the object each render
// causes useSyncExternalStore to think the snapshot changed and can loop.
const SERVER_CONSENT_SNAPSHOT = { exists: false, state: { ...DEFAULT_CONSENT_STATE } };
const getServerConsent = () => SERVER_CONSENT_SNAPSHOT;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsent);
  const enabled = Boolean(GA_ID) && Boolean(consent.state.analytics);

  // Keep GA storage aligned with consent in real time.
  useEffect(() => {
    if (typeof window === "undefined" || !GA_ID) return;
    const disabled = !consent.state.analytics;
    window[`ga-disable-${GA_ID}`] = disabled;

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: disabled ? "denied" : "granted",
      });
    }

    if (disabled) clearAnalyticsCookies();
  }, [consent.state.analytics]);

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
