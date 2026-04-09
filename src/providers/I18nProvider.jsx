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

    // ✅ MOVED OUTSIDE - now accessible to handleConsentUpdated
    const detectLanguageFromCountry = () => {
      let siteCountryCookie = Cookies.get("siteCountry");

      if (!siteCountryCookie) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("[I18n] 📍 Browser timezone:", timezone);
        
        if (timezone.includes("Helsinki") || timezone === "Europe/Helsinki" || timezone === "Europe/Kiev"  || timezone === "Europe/Kyiv") {
          siteCountryCookie = "FI";
        } else if (timezone === "Asia/Singapore" || timezone === "Asia/Kuala_Lumpur") {
          siteCountryCookie = "SG";
        }
          if (!siteCountryCookie) {
              siteCountryCookie = "EN";
         }
        if (siteCountryCookie) {
          Cookies.set("siteCountry", siteCountryCookie, {
            sameSite: "lax",
            path: "/",
            expires: 365,
          });
        }
      }

      const countryCode = String(Cookies.get("siteCountry") ?? "").trim().toUpperCase();
      if (!countryCode) return;

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
    };

    if (!hasSavedCurrency) {
      detectLanguageFromCountry();
    }

    const handleConsentUpdated = () => {
      const nextHasPreference = hasPreferenceConsent();
      setPreferenceConsent(nextHasPreference);
      
      if (!nextHasPreference) {
        setLanguageState(DEFAULT_LANGUAGE);
        setCurrencyState(DEFAULT_CURRENCY);
      } 
      //this change on 09/04/2026 else added
      else {
        
        // ✅ Re-detect when consent IS ACCEPTED
        detectLanguageFromCountry();
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
