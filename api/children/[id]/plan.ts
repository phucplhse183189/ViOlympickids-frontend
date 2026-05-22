import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../../_db";

/**
 * PUT /api/children/:id/plan
 * Body: { plan: "FREE"|"PRO"|"VIP", daysLeft?: number }
 * Cập nhật gói dịch vụ của bé
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const childId = req.query.id as string;
    const { plan, daysLeft } = req.body as {
      plan: "FREE" | "PRO" | "VIP";
      daysLeft?: number;
    };

    if (!childId || !plan) {
      return res.status(400).json({ error: "Thiếu childId hoặc plan" });
    }

    const [updated] = await db
      .update(schema.children)
      .set({
        plan,
        planDaysLeft: daysLeft ?? null,
      })
      .where(eq(schema.children.id, childId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bé" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Update plan error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
