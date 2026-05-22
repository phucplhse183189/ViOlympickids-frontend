import type { VercelRequest, VercelResponse } from "@vercel/node";
import { asc } from "drizzle-orm";
import { db, schema } from "../_db";

/**
 * GET /api/lessons/topics
 * Lấy tất cả chủ đề kèm bài học, sắp xếp theo topicNumber → lessonNumber
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lấy tất cả topics, sắp xếp theo topicNumber
    const topicRows = await db
      .select()
      .from(schema.topics)
      .orderBy(asc(schema.topics.topicNumber));

    // Lấy tất cả lessons, sắp xếp theo lessonNumber
    const lessonRows = await db
      .select()
      .from(schema.lessons)
      .orderBy(asc(schema.lessons.lessonNumber));

    // Gộp lessons vào từng topic
    const result = topicRows.map((topic) => ({
      ...topic,
      lessons: lessonRows.filter((l) => l.topicId === topic.id),
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get topics error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
