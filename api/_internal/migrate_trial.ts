import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";

/**
 * GET /api/migrate-trial
 * 
 * Script chạy một lần để nâng cấp các tài khoản cũ lên 3 ngày học thử PRO:
 * 1. Nếu đang là FREE -> Đổi thành PRO và plan_days_left = 3.
 * 2. Nếu đang là PRO/VIP (có plan_days_left > 0) -> Cộng thêm 3 ngày.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    console.log("🚀 Bắt đầu chạy Migration: Cấp phát 3 ngày học thử...");

    // 1. Nâng cấp tài khoản FREE lên PRO 3 ngày
    const upgradeFree = await db.execute(sql`
      UPDATE children 
      SET plan = 'PRO', plan_days_left = 3 
      WHERE plan = 'FREE'
      RETURNING id
    `);

    // @ts-ignore
    const freeRows = upgradeFree.rows || upgradeFree;

    // 2. Cộng thêm 3 ngày cho tài khoản PRO/VIP hiện tại (có hạn)
    const addDays = await db.execute(sql`
      UPDATE children 
      SET plan_days_left = plan_days_left + 3 
      WHERE plan != 'FREE' AND plan_days_left IS NOT NULL AND plan_days_left > 0
      RETURNING id
    `);

    // @ts-ignore
    const addDaysRows = addDays.rows || addDays;

    console.log(`✅ Đã cấp gói PRO 3 ngày cho ${freeRows.length} học sinh (từ FREE).`);
    console.log(`✅ Đã cộng thêm 3 ngày cho ${addDaysRows.length} học sinh (PRO/VIP có hạn).`);

    return res.status(200).json({ 
      success: true, 
      message: "Migration hoàn tất",
      upgradedFromFree: freeRows.length,
      addedDaysToPro: addDaysRows.length
    });
  } catch (err: any) {
    console.error("Migration error:", err);
    return res.status(500).json({ error: err.message });
  }
}
