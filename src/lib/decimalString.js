/**
 * Format a numeric API / DB value for controlled decimal inputs and table display.
 * Trims float noise. Uses toFixed (not n * 10^digits) so large values stay accurate —
 * e.g. 40004.56 is past MAX_SAFE_INTEGER when scaled by 1e12 in plain Number math.
 */
export function formatDecimalStringForInput(value, maxFractionDigits = 12) {
  if (value === null || value === undefined) return "";
  if (value === "" || (typeof value === "string" && !String(value).trim())) return "";
  const s = String(value).trim();
  if (s === "" || s === "-") return "";
  const n = Number(s.replace(/,/g, "."));
  if (!Number.isFinite(n)) return s;
  if (n === 0) return "0";
  const cap = 20;
  const safeDigits = Math.min(
    Math.max(Math.floor(Number(maxFractionDigits) || 0), 0),
    cap
  );
  return n.toFixed(safeDigits).replace(/0+$/, "").replace(/\.$/, "");
}
