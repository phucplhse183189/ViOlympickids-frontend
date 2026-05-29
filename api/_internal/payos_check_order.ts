import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/payos/check-order?orderCode=xxx
 *
 * Frontend gọi khi user quay lại từ PayOS (returnUrl)
 * để kiểm tra trạng thái thanh toán.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const orderCode = Number(req.query.orderCode);

    if (!orderCode || isNaN(orderCode)) {
      return res.status(400).json({ error: "Thiếu hoặc sai orderCode" });
    }

    const [order] = await db
      .select()
      .from(schema.paymentOrders)
      .where(eq(schema.paymentOrders.orderCode, orderCode));

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Lấy tên bé
    const [child] = await db
      .select({ name: schema.children.name, avatarEmoji: schema.children.avatarEmoji })
      .from(schema.children)
      .where(eq(schema.children.id, order.childId));

    return res.status(200).json({
      status: order.status,
      plan: order.plan,
      cycle: order.cycle,
      amount: order.amount,
      childName: child?.name || "",
      childEmoji: child?.avatarEmoji || "",
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  } catch (err) {
    console.error("Check order error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
