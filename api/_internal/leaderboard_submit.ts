import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, and, count } from "drizzle-orm";
import { db, schema } from "../_db.js";
import { invalidateCache } from "./_leaderboard_cache.js";

/**
 * POST /api/leaderboard/submit
 * Body: { childId, lessonId, score, totalQuestions }
 * Ghi nhận kết quả làm quiz của bé, tự tính attemptNumber.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { childId, lessonId, score, totalQuestions } = req.body ?? {};

    if (!childId || !lessonId || score == null || !totalQuestions) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // ── Đếm số lần đã làm để tính attemptNumber ──────────────────────────
    const [result] = await db
      .select({ cnt: count() })
      .from(schema.quizAttempts)
      .where(
        and(
          eq(schema.quizAttempts.childId, childId),
          eq(schema.quizAttempts.lessonId, lessonId)
        )
      );

    const attemptNumber = Number(result.cnt) + 1;

    // ── Chèn bản ghi mới ─────────────────────────────────────────────────
    const [created] = await db
      .insert(schema.quizAttempts)
      .values({
        childId,
        lessonId,
        score: Number(score),
        totalQuestions: Number(totalQuestions),
        attemptNumber,
      })
      .returning();

    // ── Xoá cache để lần query kế sẽ lấy dữ liệu mới ────────────────────
    invalidateCache(`leaderboard:${lessonId}`);

    return res.status(201).json(created);
  } catch (err) {
    console.error("Leaderboard submit error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
