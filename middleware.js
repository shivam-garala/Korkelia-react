import { NextResponse } from "next/server";
import { isProtectedPath } from "./src/routes/routes";

const LANGUAGE_COOKIE = "siteLang";
const COUNTRY_COOKIE = "siteCountry";
// Default to English unless the country is explicitly Finnish.
const DEFAULT_LANGUAGE = "en";
const FINNISH_COUNTRY_CODES = new Set(["FI"]);
const SUPPORTED_LANGUAGES = new Set(["en", "fi"]);
const REDIRECT_HOME_PATHS = new Set([
  "/pages/timantin-puhtausluokittelu",
  "/products/kukkasormus",
  "/pages/timantin-hiontamuodot",
  "/pages/timantin-vari",
  "/pages/jalometallit-ja-niiden-ominaisuudet",
  "/pages/tietoa-laboratoriossa-valmistetuista-timanteista",
  "/pages/karaattipaino-selitettyna",
  "/pages/timanttikorujen-huolto",
  "/pages/meidan-liike",
  "/pages/milloin-ja-miten-kosia",
  "/pages/timanttitietoutta",
  "/products/kopio-puoliallianssi-sormus-0-33ct-3",
  "/collections/frontpage",
  "/products/timanttikorvakorut",
  "/collections/sileat-kivettomat-sormukset",
  "/products/kopio-kapea-taysallianssisormus-briljanteilla-0-50ct",
  "/collections/sormukset",
  "/products/kopio-kihlasormus-3mm-bombe-court-premium",
  "/products/kopio-kihlasormus-3mm-bombe-court",
  "/pages/nain-tilaat-verkkokaupasta",
  "/products/kopio-kopio-puoliallianssi-sormus-0-33ct",
  "/products/kopio-briljantti-hiontainen-halosormus-yht-0-35ct",
  "/pages/ota-yhteytta",
  "/pages/tilaustyopalvelu",
  "/products/kopio-kihlasormus-4mm-bombe-court-premium",
  "/products/kopio-puoliallianssi-sormus-0-33ct-1",
  "/products/sun-matt-kihlasormus-5-mm",
  "/products/criss-cross-kihlasormus-4-5mm",
  "/products/ice-matt-kihlasormus-4-5-mm-1",
  "/pages/tilaustyot",
  "/pages/koru-opas",
]);

const normalizeLanguage = (value) => {
  if (!value) return "";
  const normalized = String(value).toLowerCase();
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "";
};

const normalizePathname = (value) => {
  if (!value) return "/";
  const normalized = String(value).toLowerCase();
  return normalized !== "/" && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
};

const resolveCountryCode = (request) => {
  const geoCountry = request.geo?.country;
  if (geoCountry) return geoCountry;
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  return headerCountry || "";
};

const resolveDefaultLanguage = (request) => {
  const country = resolveCountryCode(request);
  if (country && FINNISH_COUNTRY_CODES.has(country.toUpperCase())) {
    return "fi";
  }
  return DEFAULT_LANGUAGE;
};

export function middleware(request) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;
  const queryLanguage = normalizeLanguage(request.nextUrl.searchParams.get("lang"));
  const existingLanguage = normalizeLanguage(request.cookies.get(LANGUAGE_COOKIE)?.value);
  const countryCode = resolveCountryCode(request);
  const countryIsFinnish = countryCode && FINNISH_COUNTRY_CODES.has(countryCode.toUpperCase());
  const fallbackLanguage = resolveDefaultLanguage(request);

  let resolvedLanguage = fallbackLanguage;
  if (queryLanguage) {
    resolvedLanguage = queryLanguage;
  } else if (existingLanguage) {
    // If an old cookie forced Finnish but the country isn't Finnish, switch to fallback.
    // comment on 09/4/2026 start
    // resolvedLanguage =
    //   existingLanguage === "fi" && !countryIsFinnish ? fallbackLanguage : existingLanguage;
    // comment on 09/4/2026 end

   // this code add on 09/4/2026 start
    if (existingLanguage === "fi" && countryCode && !countryIsFinnish) {
    resolvedLanguage = fallbackLanguage;
  } else {
    resolvedLanguage = existingLanguage;
  }
    //this code add on 09/4/2026 end
  }
  const shouldSetLanguage = !existingLanguage || existingLanguage !== resolvedLanguage;
  const existingCountry = request.cookies.get(COUNTRY_COOKIE)?.value;
  const shouldSetCountry = countryCode && countryCode !== existingCountry;
  const normalizedPathname = normalizePathname(pathname);
  console.log("[middleware] country detection", {
    ip: request.ip ?? request.headers.get("x-real-ip") ?? null,
    forwardedFor: request.headers.get("x-forwarded-for") ?? null,
    geoCountry: request.geo?.country ?? null,
    headerCountries: {
      vercel: request.headers.get("x-vercel-ip-country") ?? null,
      cf: request.headers.get("cf-ipcountry") ?? null,
      xCountryCode: request.headers.get("x-country-code") ?? null,
    },
    countryCode,
    existingCountry,
    resolvedLanguage,
    fallbackLanguage,
    queryLanguage,
    path: pathname,
  });
  let response;

  if (normalizedPathname === "/collections/kihlasormus-naiselle-taydellinen-sormus") {
    response = NextResponse.redirect(
      new URL(
        "/collections/kihlasormus-naiselle-loyda-juuri-sinulle-taydellinen-sormus",
        request.url
      )
    );
  }

  if (
    normalizedPathname ===
    "/collections/kihlasormus-naiselle-loyda-juuri-sinulle-taydellinen-sormus"
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-lang", resolvedLanguage);
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    if (shouldSetLanguage) {
      response.cookies.set(LANGUAGE_COOKIE, resolvedLanguage, { sameSite: "lax", path: "/" });
    }
    if (shouldSetCountry) {
      response.cookies.set(COUNTRY_COOKIE, countryCode, { sameSite: "lax", path: "/" });
    }
    return response;
  }

  // Protect API routes (except explicitly public ones)
  const PUBLIC_API_ROUTES = ["/api/recaptcha", "/api/geo"];
  const isApiRoute = pathname.startsWith("/api");
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
  
  if (isApiRoute && !isPublicApiRoute && !token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!response && REDIRECT_HOME_PATHS.has(normalizedPathname)) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else if (!response && isProtectedPath(pathname) && !token) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (!response && pathname.startsWith("/login") && token) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (!response) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-lang", resolvedLanguage);
    if (countryCode) {
      requestHeaders.set("x-country-code", countryCode);
    }
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (shouldSetLanguage) {
    response.cookies.set(LANGUAGE_COOKIE, resolvedLanguage, { sameSite: "lax", path: "/" });
  }
  if (shouldSetCountry) {
    response.cookies.set(COUNTRY_COOKIE, countryCode, { sameSite: "lax", path: "/" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon_icon.ico|robots.txt).*)"],
};
