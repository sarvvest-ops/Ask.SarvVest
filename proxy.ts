import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new Response("Admin authentication is not configured.", {
      status: 500,
    });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    try {
      const base64Credentials = authHeader.split(" ")[1];
      const credentials = atob(base64Credentials);
      const separatorIndex = credentials.indexOf(":");

      if (separatorIndex > -1) {
        const inputUsername = credentials.slice(0, separatorIndex);
        const inputPassword = credentials.slice(separatorIndex + 1);

        if (inputUsername === username && inputPassword === password) {
          return NextResponse.next();
        }
      }
    } catch {
      // Invalid Basic Auth header.
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Ask SarvVest Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};