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
    const data = req.body;
    
    // Only update allowed fields
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.requiredPlan !== undefined) updateData.requiredPlan = data.requiredPlan;
    if (data.gameType !== undefined) updateData.gameType = data.gameType;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;

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
