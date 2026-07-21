"use client";

import Cookies from "js-cookie";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../lib/axiosClient.js";
import {
  CURRENCY_BY_VALUE,
  getCountryCodeForCurrency,
  getCurrencyOption,
} from "../constants/currencyOptions.js";
import {
  getDefaultLanguageForGeoCountry,
  isCurrencyShownOnWebsite,
  isEuroGeoFallback,
  resolveGeoTargetCurrency,
} from "../lib/geoPreferences.js";
import en from "../i18n/en.json";
import fi from "../i18n/fi.json";
import { getIpAddress } from "../lib/ipAddress.js";

const dictionaries = { en, fi };
const DEFAULT_LANGUAGE = "en";
const DEFAULT_CURRENCY = "eur";
const COOKIE_NAME = "siteLang";
const CURRENCY_COOKIE = "siteCurrency";
const CURRENCY_STORAGE_KEY = "currency";
/** Persisted geo / visitor country (ISO 3166-1 alpha-2); updated when `/api/geo` resolves or user picks currency. */
const COUNTRY_CODE_STORAGE_KEY = "siteCountryCode";
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

function readStoredCountryCode() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage?.getItem(COUNTRY_CODE_STORAGE_KEY);
    if (typeof raw !== "string" || !raw.trim()) return null;
    const cc = raw.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(cc) ? cc : null;
  } catch {
    return null;
  }
}

function persistCountryCodeToStorage(countryCode) {
  if (typeof window === "undefined") return;
  try {
    const cc = String(countryCode ?? "")
      .trim()
      .toUpperCase();
    if (cc && /^[A-Z]{2}$/.test(cc)) {
      window.localStorage.setItem(COUNTRY_CODE_STORAGE_KEY, cc);
    }
  } catch {
    /* ignore */
  }
}

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
  const n = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!n) return DEFAULT_CURRENCY;
  const upper = n.toUpperCase();
  if (CURRENCY_BY_VALUE[upper]) return n;
  return DEFAULT_CURRENCY;
};

/** Dedupe rapid repeat `/api/geo` calls (e.g. React Strict Mode double mount). */
let geoJsonHttpCache = null;
let geoJsonHttpCacheAt = 0;
const GEO_JSON_CACHE_MS = 20_000;

async function fetchGeoJsonCached() {
  if (typeof window === "undefined") return null;
  if (geoJsonHttpCache && Date.now() - geoJsonHttpCacheAt < GEO_JSON_CACHE_MS) {
    return geoJsonHttpCache;
  }
  const testIp = await getIpAddress();

  const geoUrl = new URL("/api/geo", window.location.origin);
  if (testIp) {
    geoUrl.searchParams.set("ip", testIp);
  }
  const res = await fetch(geoUrl.href, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const j = res.ok ? await res.json() : {};
  geoJsonHttpCache = j;
  geoJsonHttpCacheAt = Date.now();
  return j;
}

/** Query param for e-commerce APIs: Euro uses legacy `EU`; others use ISO 4217 uppercase. */
export const toCurrencyParam = (currency) => {
  const c = String(currency ?? "")
    .trim()
    .toLowerCase();
  if (!c || c === "eur") return "EU";
  return c.toUpperCase();
};

export function I18nProvider({ children }) {
  // Start with default language to match server-side render
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  /** ISO 3166-1 alpha-2 from `/api/geo` (and timezone hint if API has no country), for UI. */
  const [geoCountryCode, setGeoCountryCode] = useState(null);

  const [preferenceConsent, setPreferenceConsent] = useState(() =>
    hasPreferenceConsent(),
  );

  // Restore last known country from localStorage immediately after mount (before geo fetch completes).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readStoredCountryCode();
    if (stored) {
      setGeoCountryCode((prev) => prev ?? stored);
    }
  }, []);

  // After hydration: cookies, then geo + admin-visible currency defaults
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const enqueue = (fn) =>
      Promise.resolve().then(() => {
        if (!cancelled) fn();
      });

    const savedLanguage = Cookies.get(COOKIE_NAME);
    const savedCurrencyCookie = Cookies.get(CURRENCY_COOKIE);
    let savedCurrencyStorage = null;
    try {
      savedCurrencyStorage =
        typeof window !== "undefined"
          ? window.localStorage?.getItem(CURRENCY_STORAGE_KEY)
          : null;
    } catch {
      savedCurrencyStorage = null;
    }
    const savedCurrency = savedCurrencyCookie ?? savedCurrencyStorage;
    const hasSavedLanguage = Boolean(
      savedLanguage && savedLanguage in dictionaries,
    );
    const hasSavedCurrency = Boolean(savedCurrency);

    if (hasSavedLanguage) {
      enqueue(() => setLanguageState(savedLanguage));
    }
    if (hasSavedCurrency) {
      const raw = String(savedCurrency).trim().toLowerCase();
      const normalized = normalizeCurrency(raw);
      enqueue(() => setCurrencyState(normalized));
    }

    const persistLang = (value) => {
      if (hasPreferenceConsent()) {
        Cookies.set(COOKIE_NAME, value, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
      }
    };
    const persistCurrency = (value) => {
      if (hasPreferenceConsent()) {
        Cookies.set(CURRENCY_COOKIE, value, {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
      }
    };

    const applyGeoDefaults = async () => {
      if (cancelled) return;

      /** Resolve country + currency hints from `/api/geo` (cached briefly to avoid duplicate calls). */
      let countryCode = null;
      let geoCurrencyCode = null;
      try {
        const j = await fetchGeoJsonCached();
        if (typeof j?.countryCode === "string" && j.countryCode.trim()) {
          countryCode = j.countryCode.trim().toUpperCase();
        }
        if (typeof j?.currencyCode === "string" && j.currencyCode.trim()) {
          const c = j.currencyCode.trim().toUpperCase();
          if (/^[A-Z]{3}$/.test(c)) geoCurrencyCode = c;
        }
      } catch {
        /* ignore */
      }

      if (!countryCode) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone?.includes("Helsinki") || timezone === "Europe/Helsinki")
          countryCode = "FI";
        else if (timezone === "Asia/Singapore") countryCode = "SG";
        else if (timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta") {
          countryCode = "IN";
        }
      }

      const savedLangNow = Cookies.get(COOKIE_NAME);
      const savedCurCookie = Cookies.get(CURRENCY_COOKIE);
      let savedCurLs = null;
      try {
        savedCurLs = window.localStorage?.getItem(CURRENCY_STORAGE_KEY);
      } catch {
        savedCurLs = null;
      }
      const savedCurNow = savedCurCookie ?? savedCurLs;
      const hasLangNow = Boolean(savedLangNow && savedLangNow in dictionaries);
      const hasCurNow = Boolean(savedCurNow);
      const needLanguage = !hasLangNow;
      const needCurrency = !hasCurNow;

      let visible = [];
      try {
        const { data } = await axiosClient.get(
          "/api/currencyRate/public-visible",
        );
        visible = Array.isArray(data?.data) ? data.data : [];
      } catch {
        visible = [];
      }

      const geoCur = resolveGeoTargetCurrency(
        geoCurrencyCode,
        countryCode,
        visible,
      );
      const nextLang = getDefaultLanguageForGeoCountry(countryCode);
      const nextLangResolved =
        nextLang in dictionaries ? nextLang : DEFAULT_LANGUAGE;
      const nextCur = normalizeCurrency(geoCur);
      const savedCurNormalized = savedCurNow
        ? normalizeCurrency(String(savedCurNow))
        : "";

      /** Finland + Euro (geo target): use Finnish even when a previous session saved English. */
      const isFinlandEuroGeo = countryCode === "FI" && nextCur === "eur";

      /** First visit: no saved language. Otherwise: Finnish when geo is FI and storefront currency resolves to EUR. */
      const shouldApplyGeoLanguage =
        needLanguage || (isFinlandEuroGeo && nextLangResolved === "fi");

      /** First visit: no saved currency. Otherwise: sync when geo implies a different currency, including EUR fallback when geo has no match in API (e.g. CN, no CNY). */
      const shouldApplyGeoCurrency =
        needCurrency ||
        (Boolean(countryCode || geoCurrencyCode) &&
          nextCur !== savedCurNormalized &&
          (isCurrencyShownOnWebsite(visible, nextCur) ||
            isEuroGeoFallback(visible, nextCur)));

      if (!cancelled) {
        setGeoCountryCode(countryCode);
        if (countryCode) {
          persistCountryCodeToStorage(countryCode);
        }
      }

      if (countryCode && hasPreferenceConsent()) {
        Cookies.set("siteCountry", String(countryCode).toUpperCase(), {
          sameSite: "lax",
          path: "/",
          expires: 365,
        });
      }

      if (cancelled) return;

      if (shouldApplyGeoLanguage) {
        enqueue(() => setLanguageState(nextLangResolved));
        persistLang(nextLangResolved);
      }
      if (shouldApplyGeoCurrency) {
        enqueue(() => setCurrencyState(nextCur));
        persistCurrency(nextCur);
        try {
          window.localStorage?.setItem(CURRENCY_STORAGE_KEY, nextCur);
        } catch {
          /* ignore */
        }
      }
    };

    void applyGeoDefaults();

    const handleConsentUpdated = () => {
      const nextHasPreference = hasPreferenceConsent();
      setPreferenceConsent(nextHasPreference);

      if (!nextHasPreference) {
        setLanguageState(DEFAULT_LANGUAGE);
        setCurrencyState(DEFAULT_CURRENCY);
        return;
      }

      geoJsonHttpCache = null;
      geoJsonHttpCacheAt = 0;
      void applyGeoDefaults();
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
        const selectedCode = String(currency ?? "").toUpperCase();
        const isVisible = list.some(
          (item) =>
            String(item.currency_code || "").toUpperCase() === selectedCode,
        );
        if (!isVisible) {
          setCurrencyState(DEFAULT_CURRENCY);
          try {
            window.localStorage?.setItem(
              CURRENCY_STORAGE_KEY,
              DEFAULT_CURRENCY,
            );
          } catch {
            /* ignore */
          }
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

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized =
      nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
    setLanguageState(normalized);
    // Only persist the language if preference consent is granted.
    if (hasPreferenceConsent()) {
      Cookies.set(COOKIE_NAME, normalized, {
        sameSite: "lax",
        path: "/",
        expires: 365,
      });
    }
  }, []);

  const setCurrency = useCallback((nextCurrency) => {
    const normalized = normalizeCurrency(nextCurrency);
    setCurrencyState(normalized);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }
    if (hasPreferenceConsent()) {
      Cookies.set(CURRENCY_COOKIE, normalized, {
        sameSite: "lax",
        path: "/",
        expires: 365,
      });
    }
  }, []);

  const dictionary = dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE];

  /** Shown next to currency: ISO from selected currency, else geo from API. */
  const displayCountryCode = useMemo(() => {
    const fromCurrency = getCountryCodeForCurrency(currency);
    if (fromCurrency) return fromCurrency;
    return geoCountryCode;
  }, [currency, geoCountryCode]);

  /** Display symbol (e.g. €, $) for the current storefront currency. */
  const currencySymbol = useMemo(() => {
    console.log("currencySymbol", getCurrencyOption(currency));
    const symbol = getCurrencyOption(currency)?.symbol ?? "€";
    console.log("currencySymbol", symbol);
    return symbol;
  }, [currency]);

  const t = useCallback(
    (key) => {
      const value = getByPath(dictionary, key);
      if (typeof value === "string") return value;
      return key;
    },
    [dictionary],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      currencyCode: toCurrencyParam(currency),
      currencySymbol,
      geoCountryCode,
      displayCountryCode,
      t,
    }),
    [
      language,
      setLanguage,
      currency,
      setCurrency,
      currencySymbol,
      geoCountryCode,
      displayCountryCode,
      t,
    ],
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
