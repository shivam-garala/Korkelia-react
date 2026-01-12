import { NextResponse } from "next/server";
import { isProtectedPath } from "./src/routes/routes";

const LANGUAGE_COOKIE = "siteLang";
const DEFAULT_LANGUAGE = "en";
const FINNISH_COUNTRY_CODES = new Set(["FI"]);
const SUPPORTED_LANGUAGES = new Set(["en", "fi"]);

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
  const existingLanguage = request.cookies.get(LANGUAGE_COOKIE)?.value;
  const shouldSetLanguage = !existingLanguage || !SUPPORTED_LANGUAGES.has(existingLanguage);
  let response;

  if (isProtectedPath(pathname) && !token) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (pathname.startsWith("/login") && token) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    response = NextResponse.next();
  }

  if (shouldSetLanguage) {
    const language = resolveDefaultLanguage(request);
    response.cookies.set(LANGUAGE_COOKIE, language, { sameSite: "lax", path: "/" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
