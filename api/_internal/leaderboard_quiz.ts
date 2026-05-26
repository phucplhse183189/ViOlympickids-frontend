import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";
import { getCached, setCached } from "./_leaderboard_cache.js";
import { resolveLessonId } from "./_resolve_lesson_id.js";

/**
 * GET /api/leaderboard/:lessonId?childId=xxx
 * Lấy bảng xếp hạng top 10 cho một bài quiz.
 * Nếu có childId → trả thêm thứ hạng của bé đó.
 */

interface RankedEntry {
  rank: number;
  childId: string;
  name: string;
  avatarEmoji: string;
  avatarBg: string | null;
  score: number;
  totalQuestions: number;
  attemptNumber: number;
  completedAt: string;
}

interface LeaderboardResult {
  top10: RankedEntry[];
  myRank: RankedEntry | null;
  totalParticipants: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawLessonId = req.query.lessonId as string;
    const childId = req.query.childId as string | undefined;

    if (!rawLessonId) {
      return res.status(400).json({ error: "Thiếu lessonId" });
    }

    // ── Giải quyết lessonId (hỗ trợ cả UUID và slug "math2-bX") ──────
    const lessonId = await resolveLessonId(rawLessonId);
    if (!lessonId) {
      return res.status(400).json({ error: `Không tìm thấy bài học: ${rawLessonId}` });
    }

    // ── Kiểm tra cache ────────────────────────────────────────────────────
    const cacheKey = `leaderboard:${lessonId}`;
    let cached = getCached<{ ranked: RankedEntry[]; totalParticipants: number }>(cacheKey);

    if (!cached) {
      // ── Truy vấn xếp hạng bằng raw SQL ───────────────────────────────
      // Cho mỗi child, lấy lần làm TỐT NHẤT:
      //   1. Điểm cao nhất
      //   2. Số lần thử thấp nhất
      //   3. Thời gian hoàn thành sớm nhất
      const rows = await db.execute(sql`
        WITH best_attempts AS (
          SELECT DISTINCT ON (qa.child_id)
            qa.child_id,
            qa.score,
            qa.total_questions,
            qa.attempt_number,
            qa.completed_at,
            c.name,
            c.avatar_emoji,
            c.avatar_bg
          FROM quiz_attempts qa
          INNER JOIN children c ON c.id = qa.child_id
          WHERE qa.lesson_id = ${lessonId}
          ORDER BY qa.child_id,
                   qa.score DESC,
                   qa.attempt_number ASC,
                   qa.completed_at ASC
        )
        SELECT
          child_id,
          score,
          total_questions,
          attempt_number,
          completed_at,
          name,
          avatar_emoji,
          avatar_bg,
          RANK() OVER (
            ORDER BY score DESC,
                     attempt_number ASC,
                     completed_at ASC
          )::int AS rank
        FROM best_attempts
        ORDER BY rank ASC, completed_at ASC
      `);

      const ranked: RankedEntry[] = rows.rows.map((r: any) => ({
        rank: Number(r.rank),
        childId: r.child_id,
        name: r.name,
        avatarEmoji: r.avatar_emoji,
        avatarBg: r.avatar_bg,
        score: Number(r.score),
        totalQuestions: Number(r.total_questions),
        attemptNumber: Number(r.attempt_number),
        completedAt: r.completed_at,
      }));

      cached = { ranked, totalParticipants: ranked.length };
      setCached(cacheKey, cached);
    }

    // ── Xây dựng response ─────────────────────────────────────────────────
    const top10 = cached.ranked.slice(0, 10);

    let myRank: RankedEntry | null = null;
    if (childId) {
      myRank = cached.ranked.find((e) => e.childId === childId) ?? null;
    }

    const result: LeaderboardResult = {
      top10,
      myRank,
      totalParticipants: cached.totalParticipants,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Leaderboard quiz error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
