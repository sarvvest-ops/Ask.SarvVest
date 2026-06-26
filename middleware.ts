import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "sv_admin_session";

export function middleware(request: NextRequest) {
  const currentSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value ?? "";

  if (currentSession) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/questions/:path*", "/api/admin/questions/:path*"],
};
