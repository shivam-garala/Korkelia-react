/**
 * Format a numeric API / DB value for controlled decimal inputs and table display.
 * Trims float noise (e.g. 83.10000000000001) and trailing zeros from fixed-point strings.
 */
export function formatDecimalStringForInput(value, maxFractionDigits = 12) {
  if (value === null || value === undefined) return "";
  if (value === "" || (typeof value === "string" && !String(value).trim())) return "";
  const s = String(value).trim();
  if (s === "" || s === "-") return "";
  const n = Number(s.replace(/,/g, "."));
  if (!Number.isFinite(n)) return s;
  if (n === 0) return "0";
  const safeDigits = Math.min(Math.max(Number(maxFractionDigits) || 0, 0), 12);
  const factor = 10 ** safeDigits;
  const rounded = Math.round((n + Number.EPSILON) * factor) / factor;
  const fixed = rounded.toFixed(safeDigits);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}
