import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin routes: the login page itself and the login API.
  const isPublicAdminRoute =
    pathname === "/admin/login" || pathname === "/api/admin/login";

  const isProtectedPage = pathname.startsWith("/admin") && !isPublicAdminRoute;
  const isProtectedApi =
    pathname.startsWith("/api/admin") && !isPublicAdminRoute;

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  if (!payload) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Gate super-admin-only routes.
  const isSuperAdminRoute =
    pathname.startsWith("/admin/admins") ||
    pathname.startsWith("/api/admin/admins");

  if (isSuperAdminRoute && payload.role !== "SUPER_ADMIN") {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
