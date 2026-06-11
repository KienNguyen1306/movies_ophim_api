import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const [rows] = await db.query(
      `SELECT
         SUM(reaction = 'like')    AS likeCount,
         SUM(reaction = 'dislike') AS dislikeCount
       FROM movie_reactions
       WHERE movie_slug = ?`,
      [slug],
    );
    return NextResponse.json({
      likeCount: Number(rows[0]?.likeCount ?? 0),
      dislikeCount: Number(rows[0]?.dislikeCount ?? 0),
    });
  } catch {
    return NextResponse.json({ likeCount: 0, dislikeCount: 0 });
  }
}
