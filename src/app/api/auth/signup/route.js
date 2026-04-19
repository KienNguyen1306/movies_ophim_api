/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 * Response: { user: { id, name, email } }
 */

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, buildSetCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const normalEmail = email.trim().toLowerCase();

    // Kiểm tra email đã tồn tại
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalEmail]
    );
    if (existing.length > 0) {
      return Response.json({ error: "Email đã được sử dụng" }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Tạo user mới
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), normalEmail, passwordHash]
    );

    const user = { id: result.insertId, name: name.trim(), email: normalEmail };
    const token = signToken(user);

    return Response.json(
      { user },
      {
        status: 201,
        headers: { "Set-Cookie": buildSetCookie(token) },
      }
    );
  } catch (err) {
    console.error("[signup]", err);
    return Response.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
