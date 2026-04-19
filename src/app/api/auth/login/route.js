/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { user: { id, name, email } }
 */

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, buildSetCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return Response.json({ error: "Vui lòng nhập email và mật khẩu" }, { status: 400 });
    }

    const normalEmail = email.trim().toLowerCase();

    // Tìm user theo email
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [normalEmail]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const found = rows[0];

    // So sánh password
    const match = await bcrypt.compare(password, found.password_hash);
    if (!match) {
      return Response.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const user = { id: found.id, name: found.name, email: found.email };
    const token = signToken(user);

    return Response.json(
      { user },
      { headers: { "Set-Cookie": buildSetCookie(token) } }
    );
  } catch (err) {
    console.error("[login]", err);
    return Response.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
