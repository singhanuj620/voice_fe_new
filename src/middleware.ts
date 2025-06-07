import { NextResponse } from "next/server";
import { API_AUTH_PREFIX, AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAuth =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");
  const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
  const isAccessingAuthRoute = AUTH_ROUTES.some((route: string) =>
    pathname.startsWith(route)
  );
  const isAccessingProtectedRoute = PROTECTED_ROUTES.some((route: string) =>
    pathname.startsWith(route)
  );

  if (isAccessingApiAuthRoute) {
    return NextResponse.next();
  }
  if (isAccessingAuthRoute) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  if (!isAuth && isAccessingProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/upload", "/chat"],
};
