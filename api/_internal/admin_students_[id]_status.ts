import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * PUT /api/admin/students/:id/status
 * Body: { status: "active" | "inactive" | "suspended" }
 * Cập nhật trạng thái tài khoản học sinh
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const studentId = req.query.id as string;
    const { status } = req.body as {
      status: "active" | "inactive" | "suspended";
    };

    if (!studentId || !status) {
      return res.status(400).json({ error: "Thiếu studentId hoặc status" });
    }

    const [updated] = await db
      .update(schema.children)
      .set({ status })
      .where(eq(schema.children.id, studentId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy học sinh" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Update student status error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
