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

export const readStoredConsent = () => {
  const raw = Cookies.get(CONSENT_COOKIE_KEY);
  if (!raw) return { exists: false, payload: null, state: { ...DEFAULT_STATE } };
  try {
    const payload = JSON.parse(raw);
    return { exists: true, payload, state: toState(payload) };
  } catch (error) {
    return { exists: false, payload: null, state: { ...DEFAULT_STATE } };
  }
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
  PREFERENCE_COOKIES.forEach((name) => Cookies.remove(name, { path: "/" }));
};

export const clearAnalyticsCookies = () => {
  const allCookies = Cookies.get() || {};
  Object.keys(allCookies).forEach((name) => {
    const matches = ANALYTICS_COOKIE_PATTERNS.some((regex) => regex.test(name));
    if (matches) {
      Cookies.remove(name, { path: "/" });
    }
  });
};

export const applyConsent = (payload) => {
  if (!payload.preferences) {
    clearPreferenceCookies();
  }
  if (!payload.analytics) {
    clearAnalyticsCookies();
  }
  writeConsentCookie(payload);
  dispatchConsentUpdated();
  return toState(payload);
};

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
