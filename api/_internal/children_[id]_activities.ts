import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/children/:id/activities
 * Lấy lịch sử hoạt động của bé
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const childId = req.query.id as string;

    if (!childId) {
      return res.status(400).json({ error: "Thiếu childId" });
    }

    const rows = await db
      .select()
      .from(schema.activities)
      .where(eq(schema.activities.childId, childId));

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Activities error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
