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

// GET /api/user/saved-movies          → Lấy toàn bộ danh sách (Profile dùng)
// GET /api/user/saved-movies?slug=xxx → Kiểm tra 1 phim đã lưu chưa (MovieCard dùng)
export async function GET(request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    // ── Kiểm tra 1 phim cụ thể ──
    if (slug) {
      const [rows] = await db.query(
        "SELECT id FROM saved_movies WHERE user_id = ? AND movie_slug = ? LIMIT 1",
        [user.id, slug],
      );
      return NextResponse.json({ isSaved: rows.length > 0 });
    }

    // ── Lấy toàn bộ danh sách ──
    const [rows] = await db.query(
      `SELECT id, movie_slug, movie_name, movie_thumb, movie_year, created_at
       FROM saved_movies
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user.id],
    );
    return NextResponse.json({ saved: rows });
  } catch (error) {
    console.error("GET saved-movies error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST /api/user/saved-movies - Lưu phim
export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { movieSlug, movieName, movieThumb, movieYear } =
      await request.json();

    if (!movieSlug || !movieName) {
      return NextResponse.json(
        { error: "Thiếu thông tin phim" },
        { status: 400 },
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM saved_movies WHERE user_id = ? AND movie_slug = ?",
      [user.id, movieSlug],
    );

    if (existing.length > 0) {
      return NextResponse.json({ message: "Phim đã được lưu", saved: true });
    }

    await db.query(
      `INSERT INTO saved_movies (user_id, movie_slug, movie_name, movie_thumb, movie_year)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, movieSlug, movieName, movieThumb || null, movieYear || null],
    );

    return NextResponse.json({
      message: "Đã lưu phim thành công",
      saved: true,
    });
  } catch (error) {
    console.error("POST saved-movies error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE /api/user/saved-movies - Bỏ lưu phim
export async function DELETE(request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { movieSlug } = await request.json();

    if (!movieSlug) {
      return NextResponse.json({ error: "Thiếu slug phim" }, { status: 400 });
    }

    await db.query(
      "DELETE FROM saved_movies WHERE user_id = ? AND movie_slug = ?",
      [user.id, movieSlug],
    );

    return NextResponse.json({ message: "Đã bỏ lưu phim", saved: false });
  } catch (error) {
    console.error("DELETE saved-movies error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
