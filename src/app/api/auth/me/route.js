/**
 * GET /api/auth/me
 * Trả về thông tin user đang đăng nhập dựa trên httpOnly cookie.
 * Response: { user: { id, name, email } } hoặc { user: null }
 */

import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return Response.json({ user: null }, { status: 200 });
  }
  // Chỉ trả về các field cần thiết (không trả về iat/exp của JWT)
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}
