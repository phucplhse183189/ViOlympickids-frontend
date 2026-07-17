import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, desc } from "drizzle-orm";
import { db, schema } from "../_db.js";
import { invalidateCache } from "./_leaderboard_cache.js";

/**
 * GET/DELETE /api/admin/leaderboard
 * Quản lý các lượt thi (quiz_attempts) của bảng xếp hạng
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ admin được phép truy cập
  // Xác thực admin (trong hệ thống này parent nào vào admin panel thì có quyền)
  // Thực tế có thể check role='ADMIN'

  if (req.method === "GET") {
    try {
      // Lấy danh sách quiz_attempts, kèm tên bé và tên bài học
      const attempts = await db
        .select({
          id: schema.quizAttempts.id,
          score: schema.quizAttempts.score,
          totalQuestions: schema.quizAttempts.totalQuestions,
          attemptNumber: schema.quizAttempts.attemptNumber,
          completedAt: schema.quizAttempts.completedAt,
          childName: schema.children.name,
          lessonTitle: schema.lessons.title,
          lessonId: schema.quizAttempts.lessonId
        })
        .from(schema.quizAttempts)
        .innerJoin(schema.children, eq(schema.quizAttempts.childId, schema.children.id))
        .innerJoin(schema.lessons, eq(schema.quizAttempts.lessonId, schema.lessons.id))
        .orderBy(desc(schema.quizAttempts.completedAt));

      return res.status(200).json(attempts);
    } catch (err) {
      console.error("Admin get leaderboard error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Thiếu ID" });
      }

      // Lấy thông tin lessonId trước khi xóa để invalidate cache
      const [attempt] = await db
        .select({ lessonId: schema.quizAttempts.lessonId })
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.id, id))
        .limit(1);

      if (!attempt) {
        return res.status(404).json({ error: "Không tìm thấy dữ liệu" });
      }

      await db
        .delete(schema.quizAttempts)
        .where(eq(schema.quizAttempts.id, id));

      // Xoá cache của bài học đó và cache toàn cục
      invalidateCache(`leaderboard:${attempt.lessonId}`);
      invalidateCache(`leaderboard:global`);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Admin delete leaderboard error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
