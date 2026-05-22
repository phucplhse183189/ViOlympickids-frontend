import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, count, sum } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/stats
 * Thống kê tổng quan cho admin:
 *   totalParents, totalStudents, totalActive, totalSuspended, totalRevenue
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Chạy song song tất cả các query thống kê
    const [
      parentCountResult,
      studentCountResult,
      activeStudentsResult,
      suspendedStudentsResult,
      revenueResult,
    ] = await Promise.all([
      // Đếm phụ huynh
      db
        .select({ value: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "parent")),
      // Đếm học sinh
      db.select({ value: count() }).from(schema.children),
      // Đếm học sinh đang hoạt động
      db
        .select({ value: count() })
        .from(schema.children)
        .where(eq(schema.children.status, "active")),
      // Đếm học sinh bị tạm ngưng
      db
        .select({ value: count() })
        .from(schema.children)
        .where(eq(schema.children.status, "suspended")),
      // Tổng doanh thu từ giao dịch thành công
      db
        .select({ value: sum(schema.transactions.amount) })
        .from(schema.transactions)
        .where(eq(schema.transactions.status, "Thành công")),
    ]);

    return res.status(200).json({
      totalParents: parentCountResult[0]?.value ?? 0,
      totalStudents: studentCountResult[0]?.value ?? 0,
      totalActive: activeStudentsResult[0]?.value ?? 0,
      totalSuspended: suspendedStudentsResult[0]?.value ?? 0,
      totalRevenue: Number(revenueResult[0]?.value ?? 0),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
