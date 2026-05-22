import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * PUT /api/admin/parents/:id/status
 * Body: { status: "active" | "inactive" | "suspended" }
 * Cập nhật trạng thái tài khoản phụ huynh
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parentId = req.query.id as string;
    const { status } = req.body as {
      status: "active" | "inactive" | "suspended";
    };

    if (!parentId || !status) {
      return res.status(400).json({ error: "Thiếu parentId hoặc status" });
    }

    const [updated] = await db
      .update(schema.users)
      .set({ status })
      .where(eq(schema.users.id, parentId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy phụ huynh" });
    }

    const { passwordHash: _, ...userInfo } = updated;
    return res.status(200).json(userInfo);
  } catch (err) {
    console.error("Update parent status error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
