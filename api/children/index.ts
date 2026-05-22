import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db";

/**
 * GET /api/children?parentId=xxx
 * Lấy danh sách hồ sơ bé của phụ huynh
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parentId = req.query.parentId as string;

    if (!parentId) {
      return res.status(400).json({ error: "Thiếu parentId" });
    }

    const kids = await db
      .select()
      .from(schema.children)
      .where(eq(schema.children.parentId, parentId));

    return res.status(200).json(kids);
  } catch (err) {
    console.error("Get children error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
