"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "../i18n/en.json";
import fi from "../i18n/fi.json";

const dictionaries = { en, fi };
const DEFAULT_LANGUAGE = "en";
const COOKIE_NAME = "siteLang";
const CURRENCY_COOKIE = "siteCurrency";
const DEFAULT_CURRENCY_BY_LANG = {
  en: "usd",
  fi: "eur",
};
const CONSENT_COOKIE = "cookieConsent";

// Countries that should default to Finnish; update this list as needed.
const FINNISH_LANGUAGE_COUNTRIES = new Set([
  "FI",
  "AX",
  "SE",
  "NO",
  "DK",
  "IS",
  "EE",
  "LV",
  "LT",
  "PL",
  "DE",
  "FR",
  "ES",
  "PT",
  "IT",
  "IE",
  "GB",
  "NL",
  "BE",
  "LU",
  "CH",
  "AT",
  "CZ",
  "SK",
  "HU",
  "SI",
  "HR",
  "BA",
  "RS",
  "ME",
  "MK",
  "AL",
  "GR",
  "BG",
  "RO",
  "MD",
  "UA",
  "BY",
  "XK",
  "TR",
  "CY",
  "MT",
  "AD",
  "SM",
  "VA",
  "LI",
  "FO",
  "GI",
  "MC",
  "GL",
  "AM",
  "AZ",
  "GE",
  "KZ",
  "RU",
]);

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
  if (normalized === "usd" || normalized === "sgd" || normalized === "dollar") return "usd";
  return "eur";
};

const defaultCurrencyForLanguage = (lang) => DEFAULT_CURRENCY_BY_LANG[lang] ?? "eur";

export const toCurrencyParam = (currency) => (currency === "usd" ? "SGD" : "EU");

export function I18nProvider({ children }) {
  // Start with default language to match server-side render
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState(defaultCurrencyForLanguage(DEFAULT_LANGUAGE));

  // After hydration, read the cookie and update language if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    // Always try to read the saved language preference (reading preferences is allowed)
    const savedLanguage = Cookies.get(COOKIE_NAME);
    if (savedLanguage && savedLanguage in dictionaries) {
      // Defer state update to avoid synchronous setState inside effect body.
      Promise.resolve().then(() => {
        if (!cancelled) {
          setLanguageState(savedLanguage);
          const savedCurrency = Cookies.get(CURRENCY_COOKIE);
          if (savedCurrency) {
            setCurrencyState(normalizeCurrency(savedCurrency));
          } else {
            const nextCurrency = defaultCurrencyForLanguage(savedLanguage);
            setCurrencyState(nextCurrency);
            Cookies.set(CURRENCY_COOKIE, nextCurrency, {
              sameSite: "lax",
              path: "/",
              expires: 365,
            });
          }
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const detectLanguageFromCountry = async () => {
      try {
        const response = await fetch("https://api.country.is/");
        if (!response?.ok) return;
        const data = await response.json();
        const countryCode = String(data?.country ?? "").trim().toUpperCase();
        if (!countryCode) return;
        const nextLanguage = FINNISH_LANGUAGE_COUNTRIES.has(countryCode) ? "fi" : "en";
        if (cancelled) return;
        const normalized = nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
        Cookies.set(COOKIE_NAME, normalized, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
        const nextCurrency = defaultCurrencyForLanguage(normalized);
        Cookies.set(CURRENCY_COOKIE, nextCurrency, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
        setCurrencyState(nextCurrency);
        setLanguageState(normalized);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Country-based language detection failed", error);
        }
      }
    };

    detectLanguageFromCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
    // Always save the language preference (it's a user preference, not tracking)
    Cookies.set(COOKIE_NAME, normalized, { sameSite: "lax", path: "/", expires: 365 });
    const nextCurrency = defaultCurrencyForLanguage(normalized);
    Cookies.set(CURRENCY_COOKIE, nextCurrency, { sameSite: "lax", path: "/", expires: 365 });
    setCurrencyState(nextCurrency);
    setLanguageState(normalized);
  }, []);

  const setCurrency = useCallback((nextCurrency) => {
    const normalized = normalizeCurrency(nextCurrency);
    Cookies.set(CURRENCY_COOKIE, normalized, { sameSite: "lax", path: "/", expires: 365 });
    setCurrencyState(normalized);
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
