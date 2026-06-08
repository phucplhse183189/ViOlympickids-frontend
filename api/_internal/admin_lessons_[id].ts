import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * PUT /api/admin/lessons/:id
 * Cập nhật thông tin bài học
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Thiếu ID bài học" });
  }

  try {
    const { title, description, requiredPlan, gameType, emoji, status } = req.body;

    const updateData: Partial<typeof schema.lessons.$inferInsert> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requiredPlan !== undefined) updateData.requiredPlan = requiredPlan;
    if (gameType !== undefined) updateData.gameType = gameType;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Không có dữ liệu cập nhật" });
    }

    const [updated] = await db
      .update(schema.lessons)
      .set(updateData)
      .where(eq(schema.lessons.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy bài học" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Update admin lesson error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
