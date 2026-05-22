import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, asc } from "drizzle-orm";
import { db, schema } from "../../_db";

/**
 * GET /api/lessons/:id/quiz
 * Lấy câu hỏi quiz của bài học, sắp xếp theo questionNumber
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const lessonId = req.query.id as string;

    if (!lessonId) {
      return res.status(400).json({ error: "Thiếu lessonId" });
    }

    const questions = await db
      .select()
      .from(schema.quizQuestions)
      .where(eq(schema.quizQuestions.lessonId, lessonId))
      .orderBy(asc(schema.quizQuestions.questionNumber));

    return res.status(200).json(questions);
  } catch (err) {
    console.error("Get quiz error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
