import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * DELETE /api/children/:id/delete
 * Soft-delete hồ sơ học sinh bằng cách set status = 'inactive'
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const childId = req.query.id as string;
    if (!childId) {
      return res.status(400).json({ error: "Thiếu ID học sinh" });
    }

    const parentId = req.headers["x-user-id"] as string | undefined;
    if (!parentId) {
      return res.status(401).json({ error: "Vui lòng đăng nhập" });
    }

    // Kiểm tra xem bé có tồn tại và thuộc về parent này không
    const [child] = await db
      .select()
      .from(schema.children)
      .where(eq(schema.children.id, childId))
      .limit(1);

    if (!child) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
    }

    if (child.parentId !== parentId) {
      return res.status(403).json({ error: "Không có quyền xóa hồ sơ này" });
    }

    // Thực hiện Soft Delete
    await db
      .update(schema.children)
      .set({ status: "inactive" })
      .where(eq(schema.children.id, childId));

    return res.status(200).json({ success: true, message: "Đã xóa hồ sơ" });
  } catch (err) {
    console.error("Delete child error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
