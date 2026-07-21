"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useI18n } from "../providers/I18nProvider.jsx";
import en from "../i18n/en.json";
import fi from "../i18n/fi.json";

const dictionaries = { en, fi };

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

// On locale-prefixed URLs (/en/about, /fi/about) the page's language is
// determined by the URL itself; elsewhere it falls back to the saved
// language cookie (same source SiteHeader's dropdown already uses).
// Pass `override` for single-language pages (e.g. a Finnish-only collection
// page) whose language is fixed by the page itself, not the URL or cookie.
export function useEffectiveLanguage(override) {
  const pathname = usePathname();
  const { language } = useI18n();
  if (override) return override;
  const urlLocale = pathname?.match(/^\/(en|fi)(\/.*)?$/)?.[1];
  return urlLocale ?? language;
}

// Same as t() from useI18n(), but keyed off the effective language above
// instead of always the language cookie, so shared components (header/
// footer/nav menu) display text that matches the page the visitor is on.
export function useEffectiveTranslation(override) {
  const effectiveLanguage = useEffectiveLanguage(override);
  const dictionary = dictionaries[effectiveLanguage] ?? dictionaries.en;
  const t = useCallback(
    (key) => {
      const value = getByPath(dictionary, key);
      return typeof value === "string" ? value : key;
    },
    [dictionary]
  );
  return useMemo(() => ({ effectiveLanguage, t }), [effectiveLanguage, t]);
}
