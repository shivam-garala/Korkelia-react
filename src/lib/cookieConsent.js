import Cookies from "js-cookie";

export const CONSENT_COOKIE_KEY = "cookieConsent";
const COOKIE_OPTIONS = { expires: 365, sameSite: "lax", path: "/" };

// Preference cookies we set ourselves and can safely clear when consent is withdrawn.
const PREFERENCE_COOKIES = ["siteLang", "siteCurrency", "siteCountry"];

// Known analytics/marketing cookies we may need to clear when consent is revoked.
const ANALYTICS_COOKIE_PATTERNS = [/^_ga/i, /^_gid$/i, /^_gat/i, /^_gcl_/i, /^AMP_TOKEN$/i];

const DEFAULT_STATE = {
  preferences: false,
  analytics: false,
  marketing: false,
};

const toState = (payload) => {
  if (payload?.choice === "accepted") {
    return { preferences: true, analytics: true, marketing: true };
  }
  return {
    preferences: Boolean(payload?.preferences),
    analytics: Boolean(payload?.analytics),
    marketing: Boolean(payload?.marketing),
  };
};

let cachedRaw = null;
let cachedConsentSnapshot = { exists: false, payload: null, state: { ...DEFAULT_STATE } };
const updateSnapshotFromRaw = (raw) => {
  cachedRaw = raw;
  cachedConsentSnapshot = buildSnapshotFromRaw(raw);
  return cachedConsentSnapshot;
};

const buildSnapshotFromRaw = (raw) => {
  if (!raw) return { exists: false, payload: null, state: { ...DEFAULT_STATE } };
  try {
    const payload = JSON.parse(raw);
    return { exists: true, payload, state: toState(payload) };
  } catch (error) {
    return { exists: false, payload: null, state: { ...DEFAULT_STATE } };
  }
};

const computeConsentSnapshot = () => {
  if (typeof document === "undefined") return cachedConsentSnapshot;
  // Normalize undefined -> null so comparisons remain stable and we don't
  // rebuild snapshots on every call when the cookie is absent.
  const raw = Cookies.get(CONSENT_COOKIE_KEY) ?? null;
  if (raw === cachedRaw) return cachedConsentSnapshot;
  return updateSnapshotFromRaw(raw);
};

export const readStoredConsent = () => {
  return computeConsentSnapshot();
};

const dispatchConsentUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cookieConsentUpdated"));
  }
};

const writeConsentCookie = (payload) => {
  Cookies.set(CONSENT_COOKIE_KEY, JSON.stringify(payload), COOKIE_OPTIONS);
};

export const clearPreferenceCookies = () => {
  const domainVariants = [undefined];
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host) {
      domainVariants.push(host);
      if (!host.startsWith(".")) {
        domainVariants.push(`.${host}`);
      }
    }
  }
  PREFERENCE_COOKIES.forEach((name) => {
    domainVariants.forEach((domain) => {
      const options = { path: "/" };
      if (domain) options.domain = domain;
      Cookies.remove(name, options);
    });
  });
};

export const clearAnalyticsCookies = () => {
  const allCookies = Cookies.get() || {};
  const domainVariants = [undefined];
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host) {
      domainVariants.push(host);
      if (!host.startsWith(".")) {
        domainVariants.push(`.${host}`);
      }
    }
  }

  Object.keys(allCookies).forEach((name) => {
    const matches = ANALYTICS_COOKIE_PATTERNS.some((regex) => regex.test(name));
    if (!matches) return;
    domainVariants.forEach((domain) => {
      const options = { path: "/" };
      if (domain) options.domain = domain;
      Cookies.remove(name, options);
      // Aggressive fallback in case js-cookie misses a variant
      const cookiePieces = [`${encodeURIComponent(name)}=`];
      cookiePieces.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      cookiePieces.push("Path=/");
      if (domain) cookiePieces.push(`Domain=${domain}`);
      if (typeof location !== "undefined" && location.protocol === "https:") {
        cookiePieces.push("Secure");
      }
      document.cookie = cookiePieces.join("; ");
    });
  });
};

export const applyConsent = (payload) => {
  // Immediately align GA runtime with the new consent to avoid a refresh.
  if (typeof window !== "undefined") {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      const disabled = !payload.analytics;
      window[`ga-disable-${gaId}`] = disabled;
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: disabled ? "denied" : "granted",
        });
      }
    }
  }

  if (!payload.preferences) {
    clearPreferenceCookies();
  }
  if (!payload.analytics) {
    clearAnalyticsCookies();
  }
  writeConsentCookie(payload);
  updateSnapshotFromRaw(JSON.stringify(payload));
  dispatchConsentUpdated();
  return toState(payload);
};

export const subscribeConsent = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    computeConsentSnapshot();
    callback();
  };
  window.addEventListener("cookieConsentUpdated", handler);
  return () => window.removeEventListener("cookieConsentUpdated", handler);
};

export const getConsentSnapshot = () => computeConsentSnapshot();

export const makePayload = (overrides) => ({
  choice: "custom",
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  ...overrides,
});

export const makeAcceptAllPayload = () =>
  makePayload({
    choice: "accepted",
    preferences: true,
    analytics: true,
    marketing: true,
  });

export const makeRejectPayload = () =>
  makePayload({
    choice: "rejected",
  });

export const DEFAULT_CONSENT_STATE = { ...DEFAULT_STATE };
