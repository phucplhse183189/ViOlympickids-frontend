import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db";

/**
 * GET /api/lessons/completed?childId=xxx
 * Lấy danh sách bài học đã hoàn thành của bé
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const childId = req.query.childId as string;

    if (!childId) {
      return res.status(400).json({ error: "Thiếu childId" });
    }

    const rows = await db
      .select()
      .from(schema.completedLessons)
      .where(eq(schema.completedLessons.childId, childId));

    // Trả về mảng lessonId để frontend dễ check
    const lessonIds = rows.map((r) => r.lessonId);

    return res.status(200).json(lessonIds);
  } catch (err) {
    console.error("Get completed lessons error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
