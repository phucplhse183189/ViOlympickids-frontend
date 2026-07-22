import type { VercelRequest, VercelResponse } from "@vercel/node";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

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
    const parentId = req.headers["x-user-id"] as string | undefined;

    if (!lessonId || !childId) {
      return res.status(400).json({ error: "Thiếu lessonId hoặc childId" });
    }

    if (!parentId) return res.status(401).json({ error: "Unauthorized" });
    const [child] = await db.select({ parentId: schema.children.parentId }).from(schema.children).where(eq(schema.children.id, childId)).limit(1);
    if (!child) return res.status(404).json({ error: "Student profile not found" });
    if (child.parentId !== parentId) return res.status(403).json({ error: "You cannot update this student profile" });
    const [existing] = await db.select().from(schema.completedLessons).where(and(eq(schema.completedLessons.childId, childId), eq(schema.completedLessons.lessonId, lessonId))).limit(1);
    if (existing) return res.status(200).json(existing);
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
