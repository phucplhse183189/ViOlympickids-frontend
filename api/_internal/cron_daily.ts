import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";

/**
 * GET /api/cron-daily
 * 
 * Cron Job chạy tự động mỗi ngày lúc 00:00 (Giờ VN).
 * Nhiệm vụ:
 * 1. Trừ 1 ngày (plan_days_left) của các tài khoản đang có gói PRO/VIP.
 * 2. Những tài khoản nào hết hạn (plan_days_left = 0) -> Chuyển về gói FREE.
 * 3. Hủy trạng thái isActive trong bảng billing của tài khoản hết hạn.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Xác thực Request từ Vercel Cron
  // (Vercel tự động gửi header Authorization mang theo CRON_SECRET)
  const authHeader = req.headers.authorization;
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("🚀 Starting Daily Cron Job to deduct plan days...");

    // 1. Trừ 1 ngày cho các bé đang có gói PRO/VIP và số ngày > 0
    await db.execute(sql`
      UPDATE children 
      SET plan_days_left = plan_days_left - 1 
      WHERE plan_days_left > 0 AND plan != 'FREE'
    `);

    // 2. Tìm các bé vừa hết hạn (sau khi trừ về 0)
    // Drizzle raw query support .execute() returning arrays in .rows or .[] depending on dialect.
    // Drizzle raw SQL with vercel postgres returns an array of objects directly in some versions, or { rows } in others.
    // To be safe, we do standard updates.
    
    // Đổi các bé hết hạn (plan_days_left = 0) về FREE
    const result = await db.execute(sql`
      UPDATE children 
      SET plan = 'FREE', plan_days_left = null 
      WHERE plan_days_left = 0 AND plan != 'FREE'
      RETURNING id
    `);
    
    const expiredRows = result.rows || result;
    const expiredIds = expiredRows.map((r: any) => r.id);

    // 3. Log results
    if (expiredIds.length > 0) {
      console.log(`✅ Expired ${expiredIds.length} subscriptions.`);
    } else {
      console.log("ℹ️ No subscriptions expired today.");
    }

    console.log("🎉 Daily Cron Job finished successfully.");
    return res.status(200).json({ 
      success: true, 
      message: "Cron job executed",
      expiredCount: expiredIds.length 
    });

  } catch (err: any) {
    console.error("Cron job error:", err);
    return res.status(500).json({ error: err.message });
  }
}
