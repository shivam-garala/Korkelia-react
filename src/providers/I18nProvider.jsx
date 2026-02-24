"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  if (normalized === "usd" || normalized === "sgd" || normalized === "dollar") return "usd";
  return "eur";
};

export const toCurrencyParam = (currency) => (currency === "usd" ? "SGD" : "EU");

export function I18nProvider({ children }) {
  // Start with default language to match server-side render
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  console.log(language, currency);

  // After hydration, read the cookie and update language if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    console.log("useEffect");

    // Always try to read the saved language preference (reading preferences is allowed)
    const savedLanguage = Cookies.get(COOKIE_NAME);
    console.log(savedLanguage);
    console.log(savedLanguage in dictionaries);
    console.log(dictionaries);
    
    if (savedLanguage && savedLanguage in dictionaries) {
      console.log("if");      // Defer state update to avoid synchronous setState inside effect body.
      Promise.resolve().then(() => {
        if (!cancelled) {
          setLanguageState(savedLanguage);
          const savedCurrency = Cookies.get(CURRENCY_COOKIE);
          if (savedCurrency) {
            setCurrencyState(normalizeCurrency(savedCurrency));
          } else {
            const nextCurrency = DEFAULT_CURRENCY;
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
    console.log("useEffect after");

    const detectLanguageFromCountry = async () => {
      console.log("detectLanguageFromCountry");
      try {
        const response = await fetch("https://api.country.is/");
        if (!response?.ok) return;
        const data = await response.json();
        const countryCode = String(data?.country ?? "").trim().toUpperCase();
        console.log(countryCode);
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

        Cookies.set(COOKIE_NAME, normalizedLanguage, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
        const normalizedCurrency = normalizeCurrency(nextCurrency);
        Cookies.set(CURRENCY_COOKIE, normalizedCurrency, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
        setCurrencyState(normalizedCurrency);
        setLanguageState(normalizedLanguage);
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
