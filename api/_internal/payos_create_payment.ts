import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";
import { payos } from "../_payos.js";

/**
 * POST /api/payos/create-payment
 * Body: { childId, parentId, plan, cycle, amount }
 *
 * Tạo payment link PayOS → trả checkoutUrl cho frontend redirect
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { childId, parentId, plan, cycle, amount } = req.body as {
      childId: string;
      parentId: string;
      plan: "PRO" | "VIP";
      cycle: "month" | "year";
      amount: number;
    };

    if (!childId || !parentId || !plan || !cycle || !amount) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Tìm tên bé để hiển thị trên PayOS
    const [child] = await db
      .select()
      .from(schema.children)
      .where(eq(schema.children.id, childId));

    if (!child) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bé" });
    }

    // Sinh orderCode: số nguyên dương unique (PayOS yêu cầu <= 9007199254740991)
    const orderCode = Number(
      `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
    );

    const cycleLabel = cycle === "month" ? "1 thang" : "12 thang";
    const description = `VIO ${plan} ${cycleLabel} - ${child.name}`;

    // Gọi PayOS tạo payment link
    const paymentLink = await payos.createPaymentLink({
      orderCode,
      amount,
      description: description.slice(0, 25), // PayOS giới hạn 25 ký tự description
      returnUrl: `https://violympickids.vercel.app/dashboard/payment-result?orderCode=${orderCode}`,
      cancelUrl: `https://violympickids.vercel.app/dashboard/payment-cancel?orderCode=${orderCode}`,
      items: [
        {
          name: `Goi ${plan} (${cycleLabel})`,
          quantity: 1,
          price: amount,
        },
      ],
    });

    // Lưu vào DB với trạng thái PENDING
    await db.insert(schema.paymentOrders).values({
      orderCode,
      parentId,
      childId,
      plan,
      cycle,
      amount,
      status: "PENDING",
    });

    return res.status(200).json({
      checkoutUrl: paymentLink.checkoutUrl,
      orderCode,
    });
  } catch (err) {
    console.error("PayOS create payment error:", err);
    return res.status(500).json({
      error: "Không thể tạo đơn thanh toán. Vui lòng thử lại.",
    });
  }
}
