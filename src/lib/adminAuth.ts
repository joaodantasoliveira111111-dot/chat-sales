import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "acessopro_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AdminUser = {
  id: string;
  email: string;
};

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "eufilipisantos",
    password: process.env.ADMIN_PASSWORD || "Melf1209@",
    secret:
      process.env.ADMIN_SESSION_SECRET ||
      process.env.WEBHOOK_SECRET ||
      "acessopro-local-admin-secret",
  };
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();
  const token = signAdminToken(username);

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getAdminSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const username = verifyAdminToken(token);
  if (!username) return null;

  return {
    id: username,
    email: `${username}@admin.local`,
  };
}

export function validateAdminCredentials(username: string, password: string) {
  const credentials = getAdminCredentials();
  return (
    safeCompare(username, credentials.username) &&
    safeCompare(password, credentials.password)
  );
}

function signAdminToken(username: string) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", getAdminCredentials().secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyAdminToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", getAdminCredentials().secret)
    .update(payload)
    .digest("base64url");

  if (!safeCompare(signature, expected)) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { username?: string; exp?: number };

    if (!decoded.username || !decoded.exp || decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded.username;
  } catch {
    return null;
  }
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
