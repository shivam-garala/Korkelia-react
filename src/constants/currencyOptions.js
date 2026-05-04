import {
  CURRENCIES_MASTER,
  CURRENCIES_MASTER_BY_CODE,
} from "./currenciesMaster.js";

/**
 * Optional flag icons for select currencies (admin / table). Others use `symbol` only.
 * @type {Record<string, { icon: string; iconAlt: string }>}
 */
const CURRENCY_ICON_OVERRIDES = {
  USD: { icon: "/icons/usa.svg", iconAlt: "United States flag" },
  EUR: { icon: "/icons/euro.svg", iconAlt: "Euro" },
  GBP: { icon: "/icons/uk.svg", iconAlt: "United Kingdom flag" },
  INR: { icon: "/icons/inr.svg", iconAlt: "India flag" },
  JPY: { icon: "/icons/jpy.svg", iconAlt: "Japan flag" },
  AUD: { icon: "/icons/aud.svg", iconAlt: "Australia flag" },
  CAD: { icon: "/icons/cad.svg", iconAlt: "Canada flag" },
  SGD: { icon: "/icons/sgd.svg", iconAlt: "Singapore flag" },
};

/**
 * @param {string} codeUpper
 * @returns {null | {
 *   value: string;
 *   name: string;
 *   symbol: string;
 *   country: string;
 *   label: string;
 *   icon?: string;
 *   iconAlt?: string;
 *   flagEmoji?: string;
 * }}
 */
function resolveCurrencyOption(codeUpper) {
  const row = CURRENCIES_MASTER_BY_CODE[codeUpper];
  if (!row) return null;
  const extra = CURRENCY_ICON_OVERRIDES[codeUpper];
  const flag = row.flagEmoji ?? "";
  const labelPrefix = flag ? `${flag} ` : "";
  return {
    value: row.code,
    name: row.name,
    symbol: row.symbol,
    country: row.country,
    flagEmoji: flag,
    label: `${labelPrefix}${row.name} (${row.code})`,
    ...(extra ?? {}),
  };
}

/** All currencies for admin dropdowns (searchable react-select). */
export const CURRENCY_OPTIONS = CURRENCIES_MASTER.map((row) =>
  resolveCurrencyOption(row.code),
).filter(Boolean);

/** @type {Record<string, NonNullable<ReturnType<typeof resolveCurrencyOption>>>} */
export const CURRENCY_BY_VALUE = Object.fromEntries(
  CURRENCY_OPTIONS.map((opt) => [opt.value, opt]),
);

export function getCurrencyOption(value) {
  const code = String(value ?? "").toUpperCase();
  return CURRENCY_BY_VALUE[code] ?? null;
}

/** ISO 3166-1 alpha-2 (or EU for Euro) from master data, for header / geo display. */
export function getCountryCodeForCurrency(value) {
  const code = String(value ?? "").trim().toUpperCase();
  if (!code) return null;
  const row = CURRENCIES_MASTER_BY_CODE[code];
  const cc = row?.countryCode;
  return typeof cc === "string" && cc.trim() ? cc.trim().toUpperCase() : null;
}

/**
 * Map a row from `GET /api/currencyRate/public-visible` to `Dropdown` option shape.
 * @param {{ currency_code?: string }} item
 */
export function optionFromPublicRateRow(item) {
  const code = String(item?.currency_code ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  const meta = resolveCurrencyOption(code);
  if (!meta) {
    return {
      value: code.toLowerCase(),
      symbol: code,
      name: code,
      label: code,
    };
  }
  return {
    value: code.toLowerCase(),
    symbol: meta.symbol,
    name: meta.name,
    label: meta.label,
    ...(meta.flagEmoji ? { flagEmoji: meta.flagEmoji } : {}),
    ...(meta.icon ? { icon: meta.icon, iconAlt: meta.iconAlt } : {}),
  };
}

/**
 * Same shape as {@link optionFromPublicRateRow} for EUR (symbol €, name, icon) — used when Euro is injected in the header but not in the rates API.
 */
export function optionEuroForPublicDropdown() {
  const meta = resolveCurrencyOption("EUR");
  if (!meta) {
    return {
      value: "eur",
      symbol: "€",
      name: "Euro",
      label: "Euro (EUR)",
      icon: "/icons/euro.svg",
      iconAlt: "Euro",
    };
  }
  return {
    value: "eur",
    symbol: meta.symbol,
    name: meta.name,
    label: meta.label,
    ...(meta.flagEmoji ? { flagEmoji: meta.flagEmoji } : {}),
    ...(meta.icon ? { icon: meta.icon, iconAlt: meta.iconAlt } : {}),
  };
}
