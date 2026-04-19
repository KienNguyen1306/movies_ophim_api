/**
 * /api/proxy  — Proxy ẩn API gốc + mã hóa response
 *
 * URL gốc (ophim1.com) chỉ tồn tại server-side, không bao giờ
 * xuất hiện trong network tab của trình duyệt người dùng.
 *
 * Query params:
 *   path  — đường dẫn tính từ root, ví dụ /phim/black-myth-wukong
 *   q     — query string gốc (tuỳ chọn), ví dụ page=1&limit=24
 *
 * Response: chuỗi base64 (AES-GCM encrypted JSON)
 */

import { encrypt } from "@/lib/crypto";

// URL gốc chỉ đọc từ biến môi trường server-only (không có tiền tố NEXT_PUBLIC_)
const ORIGIN = process.env.OPHIM_ORIGIN ?? "https://ophim1.com";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const q = searchParams.get("q") ?? "";

  if (!path) {
    return new Response(
      JSON.stringify({ error: "Missing required param: path" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Chỉ cho phép path bắt đầu bằng /
  if (!path.startsWith("/")) {
    return new Response(
      JSON.stringify({ error: "Invalid path" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const targetUrl = q
      ? `${ORIGIN}${path}?${q}`
      : `${ORIGIN}${path}`;

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CineTube/1.0)",
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // cache 60 giây ở server
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstream.status}` }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await upstream.json();
    const token = await encrypt(json); // mã hóa toàn bộ payload

    return new Response(token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // Không cache ở CDN — chỉ cache ở Next.js server (next.revalidate)
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[proxy] fetch error:", err);
    return new Response(
      JSON.stringify({ error: "Internal proxy error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
