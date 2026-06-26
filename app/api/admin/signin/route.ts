import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionValue,
  isValidAdminCredentials,
} from "../../../lib/adminAuth";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = clean(formData.get("username"));
  const password = clean(formData.get("password"));
  const baseUrl = new URL(request.url);

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", baseUrl), {
      status: 303,
    });
  }

  const response = NextResponse.redirect(new URL("/admin/questions", baseUrl), {
    status: 303,
  });

  response.cookies.set(ADMIN_COOKIE_NAME, getAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
