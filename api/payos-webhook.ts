import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "./_db.js";
import { payos } from "./_payos.js";

/**
 * POST /api/payos-webhook
 *
 * PayOS gọi endpoint này khi thanh toán thành công.
 * File này đặt riêng (KHÔNG qua master router) để PayOS gọi trực tiếp.
 *
 * Luồng:
 * 1. Xác minh chữ ký (checksum) bằng PayOS SDK
 * 2. Tìm payment_order theo orderCode
 * 3. Cập nhật plan cho child → VIP/PRO
 * 4. Ghi transaction vào DB
 * 5. Cập nhật billing record
 * 6. Trả 200 OK cho PayOS
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Xác minh webhook data bằng PayOS SDK (kiểm tra checksum/signature)
    let webhookData;
    try {
      webhookData = payos.verifyPaymentWebhookData(req.body);
    } catch (verifyErr) {
      console.error("PayOS webhook verification failed:", verifyErr);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    // 2. Kiểm tra mã thanh toán thành công
    // PayOS webhook data: { orderCode, amount, description, accountNumber, reference, transactionDateTime, ... }
    const orderCode = webhookData.orderCode;
    
    // PayOS gửi webhook test với orderCode = 123 khi đăng ký webhook
    // → bỏ qua, trả 200 OK
    if (orderCode === 123) {
      console.log("PayOS webhook test received, responding OK");
      return res.status(200).json({ success: true });
    }

    console.log(`PayOS webhook received for orderCode: ${orderCode}`);

    // 3. Tìm payment order trong DB
    const [order] = await db
      .select()
      .from(schema.paymentOrders)
      .where(eq(schema.paymentOrders.orderCode, orderCode));

    if (!order) {
      console.error(`Payment order not found: ${orderCode}`);
      // Trả 200 để PayOS không retry (order không tồn tại)
      return res.status(200).json({ success: false, message: "Order not found" });
    }

    // Nếu đã xử lý rồi → skip (idempotent)
    if (order.status === "PAID") {
      console.log(`Order ${orderCode} already PAID, skipping`);
      return res.status(200).json({ success: true });
    }

    // 4. Tính daysLeft dựa trên cycle
    const daysLeft = order.cycle === "year" ? 365 : 30;

    // 5. UPDATE children → set plan + planDaysLeft
    await db
      .update(schema.children)
      .set({
        plan: order.plan,
        planDaysLeft: daysLeft,
      })
      .where(eq(schema.children.id, order.childId));

    // 6. INSERT transaction record
    const planLabel = order.plan === "VIP" ? "Gói VIP" : "Gói Pro";
    const cycleLabel = order.cycle === "year" ? "12 tháng" : "1 tháng";

    await db.insert(schema.transactions).values({
      parentId: order.parentId,
      childId: order.childId,
      date: new Date().toLocaleDateString("vi-VN"),
      amount: order.amount,
      method: "PayOS",
      status: "Thành công",
    });

    // 7. UPDATE hoặc INSERT billing record
    const [existingBilling] = await db
      .select()
      .from(schema.billing)
      .where(eq(schema.billing.childId, order.childId));

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + daysLeft);
    const renewalDateStr = renewalDate.toLocaleDateString("vi-VN");

    if (existingBilling) {
      await db
        .update(schema.billing)
        .set({
          planName: `${planLabel} (${cycleLabel})`,
          pricePerMonth: order.cycle === "year" 
            ? Math.round(order.amount / 12) 
            : order.amount,
          renewalDate: renewalDateStr,
          paymentMethod: "PayOS",
          cycle: order.cycle === "year" ? "Hàng năm" : "Hàng tháng",
          isActive: true,
        })
        .where(eq(schema.billing.childId, order.childId));
    } else {
      await db.insert(schema.billing).values({
        childId: order.childId,
        planName: `${planLabel} (${cycleLabel})`,
        pricePerMonth: order.cycle === "year" 
          ? Math.round(order.amount / 12) 
          : order.amount,
        renewalDate: renewalDateStr,
        paymentMethod: "PayOS",
        cycle: order.cycle === "year" ? "Hàng năm" : "Hàng tháng",
        isActive: true,
      });
    }

    // 8. UPDATE payment_orders → PAID
    await db
      .update(schema.paymentOrders)
      .set({
        status: "PAID",
        paidAt: new Date(),
        payosTransactionId: String(webhookData.reference || ""),
      })
      .where(eq(schema.paymentOrders.orderCode, orderCode));

    console.log(`✅ Order ${orderCode} → PAID. Child ${order.childId} upgraded to ${order.plan}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("PayOS webhook handler error:", err);
    // Vẫn trả 200 để PayOS không retry liên tục gây lỗi
    return res.status(200).json({ success: false, error: "Internal error" });
  }
}
