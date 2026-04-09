"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../lib/axiosClient.js";
import en from "../i18n/en.json";
import fi from "../i18n/fi.json";

const dictionaries = { en, fi };
const DEFAULT_LANGUAGE = "en";
const DEFAULT_CURRENCY = "eur";
const COOKIE_NAME = "siteLang";
const CURRENCY_COOKIE = "siteCurrency";
const CONSENT_COOKIE = "cookieConsent";

const hasPreferenceConsent = () => {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.preferences === "boolean") {
      return parsed.preferences;
    }
    if (parsed?.choice === "accepted") return true;
    return Boolean(parsed?.analytics || parsed?.marketing);
  } catch (error) {
    return false;
  }
};

function getByPath(object, path) {
  if (!object) return undefined;
  const parts = path.split(".");
  let current = object;
  for (const part of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

const I18nContext = createContext(null);

const normalizeCurrency = (value) => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "usd" || normalized === "sgd" || normalized === "singapore dollar") return "usd";
  return "eur";
};

export const toCurrencyParam = (currency) => (currency === "usd" ? "SGD" : "EU");

export function I18nProvider({ children }) {
  // Start with default language to match server-side render
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  console.log("[I18n] initial state", { language, currency });

  const [preferenceConsent, setPreferenceConsent] = useState(() => hasPreferenceConsent());

  // After hydration, read the cookie and update language if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const enqueue = (fn) =>
      Promise.resolve().then(() => {
        if (!cancelled) fn();
      });

    const savedLanguage = Cookies.get(COOKIE_NAME);
    const savedCurrency = Cookies.get(CURRENCY_COOKIE);
    const hasSavedLanguage = Boolean(savedLanguage && savedLanguage in dictionaries);
    const hasSavedCurrency = Boolean(savedCurrency);

    if (hasSavedLanguage) {
      enqueue(() => setLanguageState(savedLanguage));
    }
    if (hasSavedCurrency) {
      const normalized = normalizeCurrency(savedCurrency);
      enqueue(() => setCurrencyState(normalized));
    }

    console.log("[I18n] savedLanguage", savedLanguage);
    console.log("[I18n] savedCurrency", savedCurrency);
    console.log("[I18n] hasSavedLanguage", hasSavedLanguage);
    console.log("[I18n] hasSavedCurrency", hasSavedCurrency);

    const detectLanguageFromCountry = () => {
     //this change 09/04/2026
     
     const allCookies = document.cookie
    .split("; ")
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

  console.log("[I18n] 🍪 All Cookies Available:", allCookies);
  
  const siteCountryCookie = Cookies.get("siteCountry");
  const countryCode1 = String(siteCountryCookie ?? "").trim().toUpperCase();
  
  console.log("[I18n] siteCountry cookie value:", siteCountryCookie);
  console.log("[I18n] Normalized countryCode:", countryCode1);
  
  if (!countryCode1) {
    console.log("[I18n] ⚠️ No country detected from siteCountry cookie");
    console.log("[I18n] This may happen if:");
    console.log("  1. Geolocation/IP detection failed in middleware");
    console.log("  2. Middleware didn't run (check deployment)");
    console.log("  3. Cookie is set but stripped by browser");
    return;
  }
  
  console.log("🌍 [I18n] User detected from:", countryCode1);
     
     
     //this chage end 09/04/2026
     
      const countryCode = String(Cookies.get("siteCountry") ?? "").trim().toUpperCase();
     // if (!countryCode) return;
     //date:09/04/2026 94 to 98 are added to provide more insights in case of missing country code, as this is crucial for language and currency detection on first visit.
       if (!countryCode) {
    console.log("[I18n] No country detected from siteCountry cookie");
    return;
  }
     console.log("🌍 [I18n] User detected from:", countryCode);  // Show country right away
    
     let nextLanguage = "en";
      let nextCurrency = "eur";

      if (countryCode === "FI") {
        nextLanguage = "fi";
        nextCurrency = "eur";
      } else if (countryCode === "SG") {
        nextLanguage = "en";
        nextCurrency = "usd";
      }

      if (cancelled) return;
      const normalizedLanguage = nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
     //this if(hasPreferenceConsent()) added on 09/04/2026.
      if (hasPreferenceConsent()) {
      Cookies.set(COOKIE_NAME, normalizedLanguage, {
        sameSite: "lax",
        path: "/",
        expires: 365,
      });
    }
      const normalizedCurrency = normalizeCurrency(nextCurrency);
      Cookies.set(CURRENCY_COOKIE, normalizedCurrency, {
        sameSite: "lax",
        path: "/",
        expires: 365,
      });
      enqueue(() => {
        setCurrencyState(normalizedCurrency);
        setLanguageState(normalizedLanguage);
      });
      console.log("[I18n] detectCountry", {
        countryCode,
        normalizedLanguage,
        normalizedCurrency,
      });
    };

    // Run detection when currency is missing (e.g., first visit with only middleware-set language)
    if (!hasSavedCurrency) {
      detectLanguageFromCountry();
    }

    const handleConsentUpdated = () => {
      const nextHasPreference = hasPreferenceConsent();
      setPreferenceConsent(nextHasPreference);
      if (!nextHasPreference) {
        // When preference consent is withdrawn, reset to defaults so UI no longer
        // relies on preference cookies that have been cleared.
        setLanguageState(DEFAULT_LANGUAGE);
        setCurrencyState(DEFAULT_CURRENCY);
      }
    };

    window.addEventListener("cookieConsentUpdated", handleConsentUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("cookieConsentUpdated", handleConsentUpdated);
    };
  }, []);

  // Check if selected currency is still visible on website; fall back to EUR if not
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currency === DEFAULT_CURRENCY) return;

    let cancelled = false;
    axiosClient
      .get("/api/currencyRate/public-visible")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        const selectedCode = currency === "usd" ? "SGD" : currency.toUpperCase();
        const isVisible = list.some(
          (item) => String(item.currency_code || "").toUpperCase() === selectedCode
        );
        if (!isVisible) {
          setCurrencyState(DEFAULT_CURRENCY);
          if (hasPreferenceConsent()) {
            Cookies.set(CURRENCY_COOKIE, DEFAULT_CURRENCY, {
              sameSite: "lax",
              path: "/",
              expires: 365,
            });
          }
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [currency]);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
    setLanguageState(normalized);
    // Only persist the language if preference consent is granted.
    if (hasPreferenceConsent()) {
      Cookies.set(COOKIE_NAME, normalized, { sameSite: "lax", path: "/", expires: 365 });
    }
    console.log("[I18n] setLanguage", { nextLanguage: normalized });
  }, []);

  const setCurrency = useCallback((nextCurrency) => {
    const normalized = normalizeCurrency(nextCurrency);
    setCurrencyState(normalized);
    if (hasPreferenceConsent()) {
      Cookies.set(CURRENCY_COOKIE, normalized, { sameSite: "lax", path: "/", expires: 365 });
    }
    console.log("[I18n] setCurrency", { nextCurrency: normalized });
  }, []);

  const dictionary = dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE];

  const t = useCallback(
    (key) => {
      const value = getByPath(dictionary, key);
      if (typeof value === "string") return value;
      return key;
    },
    [dictionary]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      currencyCode: toCurrencyParam(currency),
      t,
    }),
    [language, setLanguage, currency, setCurrency, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return value;
}
