import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, asc } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/lessons/:id/quiz
 * Lấy câu hỏi quiz của bài học, sắp xếp theo questionNumber
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const slug = req.query.id as string;

    if (!slug) {
      return res.status(400).json({ error: "Thiếu lessonId" });
    }

    const GAME_TYPE_MAP: Record<string, string> = {
      "math2-b1": "number-review-game",
      "math2-b2": "number-sequence-chart",
      "math2-b7": "add-across-ten-game",
      "math2-b46": "math2-quiz-3d",
      "math2-quiz-3d": "math2-quiz-3d",
      "pipe-balance": "pipe-balance-game",
      "matific-canvas": "matific-canvas-game",
    };

    const targetGameType = GAME_TYPE_MAP[slug] || slug;

    const questions = await db
      .select({
        id: schema.quizQuestions.id,
        lessonId: schema.quizQuestions.lessonId,
        questionNumber: schema.quizQuestions.questionNumber,
        question: schema.quizQuestions.question,
        visual: schema.quizQuestions.visual,
        options: schema.quizQuestions.options,
        correctIndex: schema.quizQuestions.correctIndex,
        explanation: schema.quizQuestions.explanation,
      })
      .from(schema.quizQuestions)
      .innerJoin(schema.lessons, eq(schema.quizQuestions.lessonId, schema.lessons.id))
      .where(eq(schema.lessons.gameType, targetGameType))
      .orderBy(asc(schema.quizQuestions.questionNumber));

    return res.status(200).json(questions);
  } catch (err) {
    console.error("Get quiz error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
