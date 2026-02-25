import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";

/**
 * Middleware to protect admin routes and lobby creation behind admin auth.
 * Unauthenticated users are redirected to /admin/login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page, login API, and logout API through
  if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isAuthenticated = token ? verifyAdminToken(token) : false;

  if (!isAuthenticated) {
    console.log("[Middleware] Blocked unauthenticated request to:", pathname);
    // API routes get a 401, pages get a redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log("[Middleware] Allowed authenticated request to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/create/:path*", "/api/admin/:path*", "/api/lobby/create/:path*"],
};
