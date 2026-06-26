import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "sv_admin_session";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getAdminSessionValue() {
  const user = process.env.ADMIN_USERNAME ?? "admin";
  const pass = process.env.ADMIN_PASSWORD ?? "";

  if (!pass) return "";

  return hash(`ask-sarvvest:${user}:${pass}`);
}

export function isValidAdminCredentials(user: string, pass: string) {
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";

  if (!expectedPass) return false;

  return user === expectedUser && pass === expectedPass;
}

export async function isAdminAuthenticated() {
  const expectedSession = getAdminSessionValue();

  if (!expectedSession) return false;

  const cookieStore = await cookies();
  const currentSession = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? "";

  return currentSession === expectedSession;
}
