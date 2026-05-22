import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db";

/**
 * GET  /api/transactions?parentId=xxx  → Lấy lịch sử giao dịch
 * POST /api/transactions              → Tạo giao dịch mới
 *   Body: { parentId, childId?, date, amount, method, status? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: Lấy danh sách giao dịch ───────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const parentId = req.query.parentId as string;

      if (!parentId) {
        return res.status(400).json({ error: "Thiếu parentId" });
      }

      const rows = await db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.parentId, parentId));

      return res.status(200).json(rows);
    } catch (err) {
      console.error("Get transactions error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  // ── POST: Tạo giao dịch mới ────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { parentId, childId, date, amount, method, status } =
        req.body as {
          parentId: string;
          childId?: string;
          date: string;
          amount: number;
          method: string;
          status?: "Thành công" | "Thất bại";
        };

      if (!parentId || !date || !amount || !method) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
      }

      const [record] = await db
        .insert(schema.transactions)
        .values({
          parentId,
          childId: childId ?? null,
          date,
          amount,
          method,
          status: status ?? "Thành công",
        })
        .returning();

      return res.status(201).json(record);
    } catch (err) {
      console.error("Create transaction error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
