import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Check NextAuth session tokens (production or dev) or direct admin token
    const token =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("duck_admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /account routes (customer dashboard)
  if (pathname.startsWith("/account")) {
    const customerToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value ||
      request.cookies.get("duck_customer_session")?.value;

    if (!customerToken) {
      const homeLoginUrl = new URL("/", request.url);
      homeLoginUrl.searchParams.set("auth", "login");
      homeLoginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(homeLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
