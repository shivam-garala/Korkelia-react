"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "../i18n/en.json";
import fi from "../i18n/fi.json";

const dictionaries = { en, fi };
const DEFAULT_LANGUAGE = "en";
const COOKIE_NAME = "siteLang";
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

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (hasPreferenceConsent()) {
      const initial = Cookies.get(COOKIE_NAME);
      if (initial in dictionaries) {
        setLanguageState(initial);
      }
    }
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = nextLanguage in dictionaries ? nextLanguage : DEFAULT_LANGUAGE;
    if (hasPreferenceConsent()) {
      Cookies.set(COOKIE_NAME, normalized, { sameSite: "lax" });
    } else {
      Cookies.remove(COOKIE_NAME, { path: "/" });
    }
    setLanguageState(normalized);
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

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return value;
}
