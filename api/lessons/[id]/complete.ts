import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, schema } from "../../_db";

/**
 * POST /api/lessons/:id/complete
 * Body: { childId: string }
 * Đánh dấu bài học hoàn thành
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const lessonId = req.query.id as string;
    const { childId } = req.body as { childId: string };

    if (!lessonId || !childId) {
      return res.status(400).json({ error: "Thiếu lessonId hoặc childId" });
    }

    const [record] = await db
      .insert(schema.completedLessons)
      .values({ childId, lessonId })
      .returning();

    return res.status(201).json(record);
  } catch (err) {
    console.error("Complete lesson error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
