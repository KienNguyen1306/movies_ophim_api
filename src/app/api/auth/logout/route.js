/**
 * POST /api/auth/logout
 * Xoá httpOnly cookie → đăng xuất.
 */

import { buildClearCookie } from "@/lib/auth";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": buildClearCookie() } }
  );
}
