import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "sv_admin_session";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const currentSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";

  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/signin") ||
    pathname.startsWith("/api/admin/signout")
  ) {
    return NextResponse.next();
  }

  if (currentSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
