import { cookies, headers } from "next/headers";
import { getDefaultLanguageForGeoCountry } from "./geoPreferences.js";

const DEFAULT_SITE_URL = "https://korkeilahelsinki.fi";

// Always https — see robots.js for why the x-forwarded-proto header isn't trusted.
const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") || headerStore.get("host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
};

// Cookie means a language was already confirmed for this visitor (by their
// own pick, or by the site's existing reliable geo detection) — trust it
// directly, exactly like the rest of the site already does.
//
// No cookie means this is this visitor's first-ever request to the site,
// landing directly on a locale-redirect page. Rather than trust middleware's
// quick fallback-in-disguise `x-site-lang` default, run the same real geo
// lookup (`/api/geo`) and the same country→language rule
// (`getDefaultLanguageForGeoCountry`) the rest of the site already relies
// on — no changes to either, just reused here too.
export const resolveStaticPageLocale = async () => {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("siteLang")?.value;
  if (cookieLanguage === "en" || cookieLanguage === "fi") {
    return cookieLanguage;
  }

  try {
    const baseUrl = await resolveBaseUrl();
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const response = await fetch(`${baseUrl}/api/geo`, {
      cache: "no-store",
      headers: forwardedFor ? { "x-forwarded-for": forwardedFor } : undefined,
    });
    if (response.ok) {
      const data = await response.json();
      return getDefaultLanguageForGeoCountry(data?.countryCode);
    }
  } catch {
    // Geo lookup unreachable — fall through to the safe default below.
  }

  return "en";
};
