import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, and, count } from "drizzle-orm";
import { db, schema } from "../_db.js";
import { invalidateCache } from "./_leaderboard_cache.js";
import { resolveLessonId } from "./_resolve_lesson_id.js";

/**
 * POST /api/leaderboard/submit
 * Body: { childId, lessonId, score, totalQuestions }
 * Ghi nhận kết quả làm quiz của bé, tự tính attemptNumber.
 * Đồng thời cập nhật dữ liệu dashboard cho phụ huynh.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { childId, lessonId: rawLessonId, score, totalQuestions } = req.body ?? {};

    if (!childId || !rawLessonId || score == null || !totalQuestions) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // ── Giải quyết lessonId (hỗ trợ cả UUID và slug "math2-bX") ──────
    const lessonId = await resolveLessonId(rawLessonId);
    if (!lessonId) {
      return res.status(400).json({ error: `Không tìm thấy bài học: ${rawLessonId}` });
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

    // ── Đánh dấu hoàn thành bài học (nếu chưa) ───────────────────────────
    const [existingCompletion] = await db
      .select({ id: schema.completedLessons.id })
      .from(schema.completedLessons)
      .where(
        and(
          eq(schema.completedLessons.childId, childId),
          eq(schema.completedLessons.lessonId, lessonId)
        )
      );

    let isFirstCompletion = false;
    if (!existingCompletion) {
      await db.insert(schema.completedLessons).values({
        childId,
        lessonId,
      });
      isFirstCompletion = true;
    }

    // ── Cập nhật Dashboard Stats ─────────────────────────────────────────
    const [stats] = await db
      .select()
      .from(schema.dashboardStats)
      .where(eq(schema.dashboardStats.childId, childId));

    if (stats) {
      await db
        .update(schema.dashboardStats)
        .set({
          overallScore: (stats.overallScore || 0) + Number(score),
          completedLessons: isFirstCompletion ? (stats.completedLessons || 0) + 1 : stats.completedLessons,
          weeklyMinutes: (stats.weeklyMinutes || 0) + 15, // Cố định 15 phút cho mỗi bài học
        })
        .where(eq(schema.dashboardStats.childId, childId));
    } else {
      await db.insert(schema.dashboardStats).values({
        childId,
        overallScore: Number(score),
        completedLessons: isFirstCompletion ? 1 : 0,
        weeklyMinutes: 15,
        streakDays: 1,
      });
    }

    // ── Xoá cache để lần query kế sẽ lấy dữ liệu mới ────────────────────
    invalidateCache(`leaderboard:${lessonId}`);
    invalidateCache(`leaderboard:global`);

    return res.status(201).json(created);
  } catch (err) {
    console.error("Leaderboard submit error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
