import { NextResponse } from "next/server";
import { isProtectedPath } from "./src/routes/routes";

const LANGUAGE_COOKIE = "siteLang";
const DEFAULT_LANGUAGE = "fi";
const FINNISH_COUNTRY_CODES = new Set(["FI"]);
const SUPPORTED_LANGUAGES = new Set(["en", "fi"]);

const normalizeLanguage = (value) => {
  if (!value) return "";
  const normalized = String(value).toLowerCase();
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "";
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
  const resolvedLanguage = queryLanguage || existingLanguage || resolveDefaultLanguage(request);
  const shouldSetLanguage = !existingLanguage || existingLanguage !== resolvedLanguage;
  let response;

  // Protect API routes (except public ones like recaptcha)
  const isApiRoute = pathname.startsWith("/api");
  const isPublicApiRoute = pathname.startsWith("/api/recaptcha");
  
  if (isApiRoute && !isPublicApiRoute && !token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (isProtectedPath(pathname) && !token) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (pathname.startsWith("/login") && token) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-site-lang", resolvedLanguage);
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (shouldSetLanguage) {
    response.cookies.set(LANGUAGE_COOKIE, resolvedLanguage, { sameSite: "lax", path: "/" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon_icon.ico|robots.txt).*)"],
};
