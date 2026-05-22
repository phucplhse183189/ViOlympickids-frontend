import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/parents
 * Lấy tất cả phụ huynh (role='parent') kèm danh sách con
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lấy tất cả parents
    const parents = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, "parent"));

    // Lấy tất cả children
    const allChildren = await db.select().from(schema.children);

    // Gộp children vào từng parent
    const result = parents.map((p) => {
      const { passwordHash: _, ...parentInfo } = p;
      return {
        ...parentInfo,
        children: allChildren.filter((c) => c.parentId === p.id),
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Admin parents error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
