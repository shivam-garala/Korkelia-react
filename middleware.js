import { NextResponse } from "next/server";
import { isProtectedPath, isPublicPath } from "./src/routes/routes";

export function middleware(request) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath(pathname) && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
