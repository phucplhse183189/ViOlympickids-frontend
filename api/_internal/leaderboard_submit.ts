import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, count, eq } from "drizzle-orm";
import { db, schema } from "../_db.js";
import { invalidateCache } from "./_leaderboard_cache.js";
import { resolveLessonId } from "./_resolve_lesson_id.js";
import { syncChildLearningStats } from "./_sync_learning_stats.js";

/** POST /api/leaderboard/submit — record a quiz and rebuild learning metrics. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { childId, lessonId: rawLessonId, score, totalQuestions } = req.body ?? {};
    if (!childId || !rawLessonId || score == null || !totalQuestions) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const numericScore = Number(score);
    const numericTotal = Number(totalQuestions);
    if (!Number.isFinite(numericScore) || !Number.isFinite(numericTotal) || numericTotal <= 0 || numericScore < 0 || numericScore > numericTotal) {
      return res.status(400).json({ error: "Điểm số không hợp lệ" });
    }

    const lessonId = await resolveLessonId(rawLessonId);
    if (!lessonId) return res.status(400).json({ error: `Không tìm thấy bài học: ${rawLessonId}` });

    const [attemptCount] = await db.select({ cnt: count() }).from(schema.quizAttempts).where(and(eq(schema.quizAttempts.childId, childId), eq(schema.quizAttempts.lessonId, lessonId)));
    const [created] = await db.insert(schema.quizAttempts).values({
      childId,
      lessonId,
      score: numericScore,
      totalQuestions: numericTotal,
      attemptNumber: Number(attemptCount.cnt) + 1,
    }).returning();

    const [completion] = await db.select({ id: schema.completedLessons.id }).from(schema.completedLessons).where(and(eq(schema.completedLessons.childId, childId), eq(schema.completedLessons.lessonId, lessonId)));
    if (!completion) await db.insert(schema.completedLessons).values({ childId, lessonId });

    // Recalculate from source tables. Retrying or replaying requests cannot
    // inflate lesson totals or average scores.
    await syncChildLearningStats(childId);

    invalidateCache(`leaderboard:${lessonId}`);
    invalidateCache("leaderboard:global");
    return res.status(201).json(created);
  } catch (err) {
    console.error("Leaderboard submit error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
