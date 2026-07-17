import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * POST /api/payos/cancel-order
 * Body: { orderCode: number }
 *
 * Cập nhật trạng thái đơn hàng PENDING → CANCELLED
 * Được gọi khi user hủy thanh toán trên PayOS (redirect về cancelUrl)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderCode } = req.body as { orderCode: number };

    if (!orderCode) {
      return res.status(400).json({ error: "Thiếu orderCode" });
    }

    const [order] = await db
      .select()
      .from(schema.paymentOrders)
      .where(eq(schema.paymentOrders.orderCode, orderCode));

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cancel nếu đang PENDING
    if (order.status !== "PENDING") {
      return res.status(200).json({ status: order.status, message: "Đơn hàng không ở trạng thái chờ xử lý" });
    }

    await db
      .update(schema.paymentOrders)
      .set({ status: "CANCELLED" })
      .where(eq(schema.paymentOrders.orderCode, orderCode));

    return res.status(200).json({ status: "CANCELLED", message: "Đã hủy đơn hàng" });
  } catch (err) {
    console.error("Cancel order error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
