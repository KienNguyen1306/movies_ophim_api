/**
 * /api/comments/[movieSlug]
 *
 * GET  → Lấy danh sách bình luận (có reply lồng vào)
 * POST → Đăng bình luận mới hoặc reply
 *
 * Body POST:
 *   { content: string, guest_name?: string, parent_id?: number }
 *
 * Ai có thể bình luận:
 *   - User đã đăng nhập  → lấy thông tin từ JWT cookie
 *   - Khách có tên       → guest_name được điền
 *   - Khách ẩn danh      → guest_name bỏ trống / không gửi
 */

import pool from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Chuyển timestamp MySQL thành "X phút/giờ/ngày trước" */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

/** Lấy ký tự đầu của tên để hiển thị avatar */
function avatarChar(name) {
  return (name || "?")[0].toUpperCase();
}

/** Chuyển row DB thành shape mà frontend đang dùng */
function formatComment(row, replies = []) {
  const displayName = row.user_name || row.guest_name || "Ẩn danh";
  return {
    id:      row.id,
    user:    displayName,
    avatar:  avatarChar(displayName),
    time:    timeAgo(row.created_at),
    text:    row.content,
    likes:   0,           // có thể mở rộng sau
    replies,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request, { params }) {
  const { movieSlug } = await params;

  try {
    // Lấy tất cả comments của phim (kể cả replies) sắp xếp từ mới nhất
    const [rows] = await pool.query(
      `SELECT
         c.id, c.content, c.parent_id, c.created_at,
         c.guest_name,
         u.name AS user_name
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.movie_slug = ?
       ORDER BY c.created_at DESC`,
      [movieSlug]
    );

    // Tách top-level vs replies
    const topLevel = rows.filter((r) => r.parent_id === null);
    const repliesMap = {};
    rows
      .filter((r) => r.parent_id !== null)
      .forEach((r) => {
        if (!repliesMap[r.parent_id]) repliesMap[r.parent_id] = [];
        // Replies hiển thị theo thứ tự tăng dần (cũ → mới)
        repliesMap[r.parent_id].push(r);
      });

    // Đảo ngược replies về thứ tự cũ → mới
    Object.values(repliesMap).forEach((arr) => arr.reverse());

    const comments = topLevel.map((c) =>
      formatComment(c, (repliesMap[c.id] || []).map((r) => formatComment(r)))
    );

    return Response.json({ comments });
  } catch (err) {
    console.error("[comments GET]", err);
    return Response.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request, { params }) {
  const { movieSlug } = await params;

  try {
    const body = await request.json();
    const { content, guest_name, parent_id } = body;

    if (!content?.trim()) {
      return Response.json({ error: "Nội dung bình luận không được để trống" }, { status: 400 });
    }

    // Kiểm tra user đăng nhập
    const authUser = await getUserFromCookie();

    // Nếu là reply, kiểm tra comment cha tồn tại
    if (parent_id) {
      const [parentRows] = await pool.query(
        "SELECT id FROM comments WHERE id = ? AND movie_slug = ? LIMIT 1",
        [parent_id, movieSlug]
      );
      if (parentRows.length === 0) {
        return Response.json({ error: "Bình luận gốc không tồn tại" }, { status: 404 });
      }
    }

    const userId    = authUser?.id   ?? null;
    const guestName = authUser        ? null : (guest_name?.trim() || null);

    const [result] = await pool.query(
      `INSERT INTO comments (movie_slug, user_id, guest_name, content, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [movieSlug, userId, guestName, content.trim(), parent_id ?? null]
    );

    // Lấy lại comment vừa tạo để trả về đúng shape
    const [newRows] = await pool.query(
      `SELECT c.id, c.content, c.parent_id, c.created_at, c.guest_name,
              u.name AS user_name
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    const comment = formatComment(newRows[0]);
    return Response.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("[comments POST]", err);
    return Response.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
