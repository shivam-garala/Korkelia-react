import { CURRENCIES_MASTER_BY_CODE } from "../constants/currenciesMaster.js";

/**
 * Rates from `GET /api/currencyRate/public-visible`. Honors `show_on_website` when present.
 */
export function filterRatesShownOnWebsite(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.filter((row) => row != null && row.show_on_website !== false);
}

/**
 * @param {string} currencyLower lowercase ISO 4217
 */
export function isCurrencyShownOnWebsite(visibleRows, currencyLower) {
  const want = String(currencyLower ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(want)) return false;
  return filterRatesShownOnWebsite(visibleRows).some(
    (row) => String(row?.currency_code ?? "").toUpperCase() === want,
  );
}

/**
 * Geo matched no visible currency (e.g. CN with no CNY in rates); logic falls back to EUR even when EUR is not listed.
 */
export function isEuroGeoFallback(visibleRows, resolvedLower) {
  const c = String(resolvedLower ?? "").trim().toLowerCase();
  return c === "eur" && !isCurrencyShownOnWebsite(visibleRows, "eur");
}

/**
 * Default storefront language from geo ISO country only (Finnish for Finland).
 */
export function getDefaultLanguageForGeoCountry(countryCode) {
  return String(countryCode ?? "").trim().toUpperCase() === "FI" ? "fi" : "en";
}

/**
 * @param {Array<{ currency_code?: string; show_on_website?: boolean }>} visibleRows
 * @param {string} preferredLower lowercase ISO 4217 (e.g. eur, usd)
 * @returns {string} lowercase currency code
 */
export function pickCurrencyWithAdminVisibility(visibleRows, preferredLower) {
  const list = filterRatesShownOnWebsite(visibleRows);
  const codes = list.map((row) => String(row?.currency_code ?? "").toUpperCase());
  const want = String(preferredLower ?? "")
    .trim()
    .toUpperCase();
  if (want && codes.includes(want)) {
    return want.toLowerCase();
  }
  return "eur";
}

/**
 * Pick a storefront currency from geo + admin-visible rates.
 * Prefer ISO 4217 from `/api/geo` (`currencyCode`) matched to public-visible `currency_code`.
 * If missing or not listed, fall back to country→currency via
 * {@link CURRENCIES_MASTER_BY_CODE}[currency].countryCode for a visible row.
 */
export function resolveGeoTargetCurrency(geoCurrencyCode, geoCountryCode, visibleRows) {
  const rows = filterRatesShownOnWebsite(visibleRows);
  const cur = String(geoCurrencyCode ?? "").trim().toUpperCase();

  if (cur && /^[A-Z]{3}$/.test(cur)) {
    if (isCurrencyShownOnWebsite(visibleRows, cur.toLowerCase())) {
      return pickCurrencyWithAdminVisibility(visibleRows, cur.toLowerCase());
    }
  }

  const geo = String(geoCountryCode ?? "").trim().toUpperCase();
  if (geo && /^[A-Z]{2}$/.test(geo)) {
    for (const row of rows) {
      const code = String(row?.currency_code ?? "").trim().toUpperCase();
      if (!/^[A-Z]{3}$/.test(code)) continue;
      const meta = CURRENCIES_MASTER_BY_CODE[code];
      const metaCc = meta?.countryCode
        ? String(meta.countryCode).toUpperCase()
        : "";
      if (metaCc && metaCc === geo) {
        return pickCurrencyWithAdminVisibility(visibleRows, code.toLowerCase());
      }
    }
  }

  /** No match (e.g. CN with no CNY); prefer EUR for storefront even if EUR is not in the API list. */
  return pickCurrencyWithAdminVisibility(visibleRows, "eur");
}
