/**
 * src/lib/auth.js
 * JWT sign / verify + helper đọc cookie trong Next.js App Router.
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET ?? "cinetube_jwt_secret_change_me";
const COOKIE = "cinetube_token";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày (giây)

// ─── Token ────────────────────────────────────────────────────────────────────

/**
 * Tạo JWT chứa payload { id, name, email }.
 * @param {{ id: number, name: string, email: string }} payload
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: MAX_AGE });
}

/**
 * Xác minh JWT. Trả về payload hoặc null nếu không hợp lệ.
 * @param {string} token
 * @returns {{ id: number, name: string, email: string } | null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// ─── Cookie helpers (Server Components / Route Handlers) ──────────────────────

/**
 * Lấy user hiện tại từ httpOnly cookie.
 * Dùng bên trong Route Handlers hoặc Server Components.
 * @returns {Promise<{ id: number, name: string, email: string } | null>}
 */
export async function getUserFromCookie() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  return verifyToken(raw);
}

/**
 * Trả về Set-Cookie header để đặt token.
 * @param {string} token
 * @returns {string}
 */
export function buildSetCookie(token) {
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
}

/**
 * Trả về Set-Cookie header để xoá cookie (logout).
 * @returns {string}
 */
export function buildClearCookie() {
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
