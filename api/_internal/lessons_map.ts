import type { VercelRequest, VercelResponse } from "@vercel/node";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/** GET /api/lessons/map?childId=... — all data required by the student map. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const childId = typeof req.query.childId === "string" ? req.query.childId : "";
  const parentId = req.headers["x-user-id"] as string | undefined;
  if (!childId) return res.status(400).json({ error: "Missing childId" });
  if (!parentId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [child] = await db.select({ id: schema.children.id, parentId: schema.children.parentId, plan: schema.children.plan, status: schema.children.status }).from(schema.children).where(eq(schema.children.id, childId)).limit(1);
    if (!child) return res.status(404).json({ error: "Student profile not found" });
    if (child.parentId !== parentId) return res.status(403).json({ error: "You cannot access this student profile" });
    const [topicRows, lessonRows, completedRows] = await Promise.all([
      db.select().from(schema.topics).orderBy(asc(schema.topics.topicNumber)),
      db.select().from(schema.lessons).orderBy(asc(schema.lessons.lessonNumber)),
      db.select({ lessonId: schema.completedLessons.lessonId }).from(schema.completedLessons).where(eq(schema.completedLessons.childId, childId)),
    ]);
    const topics = topicRows.map(topic => ({ ...topic, lessons: lessonRows.filter(lesson => lesson.topicId === topic.id) }));
    return res.status(200).json({ topics, completedLessonIds: [...new Set(completedRows.map(row => row.lessonId))], student: { id: child.id, plan: child.plan, status: child.status }, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Student map error:", error);
    return res.status(500).json({ error: "Unable to load the learning map" });
  }
}
