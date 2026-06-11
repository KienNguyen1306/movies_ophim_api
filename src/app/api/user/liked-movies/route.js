import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { cookies } from "next/headers";

async function getUserFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cinetube_token")?.value;
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/user/liked-movies - Lấy tất cả reactions của user
export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, movie_slug, movie_name, movie_thumb, movie_year, reaction, created_at
       FROM movie_reactions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user.id],
    );

    const liked = rows.filter((r) => r.reaction === "like");
    const disliked = rows.filter((r) => r.reaction === "dislike");

    return NextResponse.json({ liked, disliked });
  } catch (error) {
    console.error("GET liked-movies error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/user/liked-movies - Thích hoặc không thích phim
export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { movieSlug, movieName, movieThumb, movieYear, reaction } =
      await request.json();

    if (!movieSlug || !movieName || !["like", "dislike"].includes(reaction)) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    // Kiểm tra reaction hiện tại
    const [existing] = await db.query(
      "SELECT id, reaction FROM movie_reactions WHERE user_id = ? AND movie_slug = ?",
      [user.id, movieSlug],
    );

    if (existing.length > 0) {
      if (existing[0].reaction === reaction) {
        // Đã react giống → bỏ reaction (toggle off)
        await db.query(
          "DELETE FROM movie_reactions WHERE user_id = ? AND movie_slug = ?",
          [user.id, movieSlug],
        );
        return NextResponse.json({ reaction: null, message: "Đã bỏ reaction" });
      } else {
        // Đổi reaction
        await db.query(
          `UPDATE movie_reactions
           SET reaction = ?, movie_name = ?, movie_thumb = ?, movie_year = ?
           WHERE user_id = ? AND movie_slug = ?`,
          [
            reaction,
            movieName,
            movieThumb || null,
            movieYear || null,
            user.id,
            movieSlug,
          ],
        );
        return NextResponse.json({ reaction, message: "Đã cập nhật reaction" });
      }
    }

    // Tạo reaction mới
    await db.query(
      `INSERT INTO movie_reactions (user_id, movie_slug, movie_name, movie_thumb, movie_year, reaction)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        movieSlug,
        movieName,
        movieThumb || null,
        movieYear || null,
        reaction,
      ],
    );

    return NextResponse.json({
      reaction,
      message: reaction === "like" ? "Đã thích phim" : "Đã không thích phim",
    });
  } catch (error) {
    console.error("POST liked-movies error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// GET /api/user/liked-movies?slug=xxx - Lấy reaction của 1 phim cụ thể
export async function PATCH(request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { movieSlug } = await request.json();
    if (!movieSlug) {
      return NextResponse.json({ reaction: null });
    }

    const [rows] = await db.query(
      "SELECT reaction FROM movie_reactions WHERE user_id = ? AND movie_slug = ?",
      [user.id, movieSlug],
    );

    return NextResponse.json({
      reaction: rows.length > 0 ? rows[0].reaction : null,
    });
  } catch (error) {
    return NextResponse.json({ reaction: null });
  }
}
