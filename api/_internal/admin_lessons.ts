import type { VercelRequest, VercelResponse } from "@vercel/node";
import { asc } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/lessons
 * Lấy tất cả bài học (kèm thông tin topic) cho Admin
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const topics = await db.select().from(schema.topics);
    const lessons = await db
      .select()
      .from(schema.lessons)
      .orderBy(asc(schema.lessons.lessonNumber));

    // Map topic info into each lesson
    const result = lessons.map((lesson) => {
      const topic = topics.find((t) => t.id === lesson.topicId);
      return {
        ...lesson,
        topicName: topic ? topic.title : "Không rõ",
        topicNumber: topic ? topic.topicNumber : 0,
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Admin lessons error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
