import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, count, sum, sql, desc } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/finance-stats
 * Thống kê tài chính thực tế từ DB:
 *   - Tổng doanh thu, số giao dịch
 *   - Doanh thu theo tháng (12 tháng gần nhất)
 *   - Phân loại theo gói (PRO/VIP)
 *   - Giao dịch gần đây nhất
 *   - Thống kê PayOS
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [
      totalRevenueResult,
      totalTransactionsResult,
      successTransactionsResult,
      failedTransactionsResult,
      monthlyRevenueResult,
      planBreakdownResult,
      recentTransactionsResult,
      paymentOrdersStatsResult,
      activeSubscriptionsResult,
    ] = await Promise.all([
      // Tổng doanh thu (giao dịch thành công)
      db
        .select({ value: sum(schema.transactions.amount) })
        .from(schema.transactions)
        .where(eq(schema.transactions.status, "Thành công")),

      // Tổng số giao dịch
      db.select({ value: count() }).from(schema.transactions),

      // Số giao dịch thành công
      db
        .select({ value: count() })
        .from(schema.transactions)
        .where(eq(schema.transactions.status, "Thành công")),

      // Số giao dịch thất bại
      db
        .select({ value: count() })
        .from(schema.transactions)
        .where(eq(schema.transactions.status, "Thất bại")),

      // Doanh thu theo tháng (12 tháng gần nhất)
      db
        .select({
          month: sql<string>`TO_CHAR(TO_DATE(${schema.transactions.date}, 'DD/MM/YYYY'), 'MM/YYYY')`,
          revenue: sum(schema.transactions.amount),
          count: count(),
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.status, "Thành công"))
        .groupBy(
          sql`TO_CHAR(TO_DATE(${schema.transactions.date}, 'DD/MM/YYYY'), 'MM/YYYY')`
        )
        .orderBy(
          sql`TO_CHAR(TO_DATE(${schema.transactions.date}, 'DD/MM/YYYY'), 'MM/YYYY') DESC`
        )
        .limit(12),

      // Doanh thu theo gói (từ paymentOrders đã thanh toán)
      db
        .select({
          plan: schema.paymentOrders.plan,
          revenue: sum(schema.paymentOrders.amount),
          count: count(),
        })
        .from(schema.paymentOrders)
        .where(eq(schema.paymentOrders.status, "PAID"))
        .groupBy(schema.paymentOrders.plan),

      // 10 giao dịch gần nhất
      db
        .select({
          id: schema.transactions.id,
          date: schema.transactions.date,
          amount: schema.transactions.amount,
          method: schema.transactions.method,
          status: schema.transactions.status,
          parentId: schema.transactions.parentId,
        })
        .from(schema.transactions)
        .orderBy(desc(schema.transactions.id))
        .limit(10),

      // Thống kê PayOS
      db
        .select({
          status: schema.paymentOrders.status,
          count: count(),
          total: sum(schema.paymentOrders.amount),
        })
        .from(schema.paymentOrders)
        .groupBy(schema.paymentOrders.status),

      // Số học sinh đang trả phí (PRO + VIP)
      db
        .select({ value: count() })
        .from(schema.children)
        .where(
          sql`${schema.children.plan} IN ('PRO', 'VIP')`
        ),
    ]);

    // Tính MRR (Monthly Recurring Revenue) từ billing
    const [mrrResult] = await Promise.all([
      db
        .select({
          total: sum(schema.billing.pricePerMonth),
        })
        .from(schema.billing)
        .where(eq(schema.billing.isActive, true)),
    ]);

    // Xây dựng doanh thu theo tháng
    const monthlyRevenue = (monthlyRevenueResult || [])
      .map((r) => ({
        month: r.month,
        revenue: Number(r.revenue ?? 0),
        transactions: Number(r.count ?? 0),
      }))
      .reverse();

    // Phân loại gói
    const planBreakdown = (planBreakdownResult || []).map((r) => ({
      plan: r.plan,
      revenue: Number(r.revenue ?? 0),
      count: Number(r.count ?? 0),
    }));

    // Giao dịch gần đây
    const recentTransactions = (recentTransactionsResult || []).map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      method: t.method,
      status: t.status,
    }));

    // PayOS stats
    const paymentOrdersStats = (paymentOrdersStatsResult || []).map((r) => ({
      status: r.status,
      count: Number(r.count ?? 0),
      total: Number(r.total ?? 0),
    }));

    return res.status(200).json({
      // Tổng quan
      totalRevenue: Number(totalRevenueResult[0]?.value ?? 0),
      totalTransactions: Number(totalTransactionsResult[0]?.value ?? 0),
      successTransactions: Number(successTransactionsResult[0]?.value ?? 0),
      failedTransactions: Number(failedTransactionsResult[0]?.value ?? 0),
      mrr: Number(mrrResult[0]?.total ?? 0),
      activeSubscriptions: Number(activeSubscriptionsResult[0]?.value ?? 0),

      // Chi tiết
      monthlyRevenue,
      planBreakdown,
      recentTransactions,
      paymentOrdersStats,
    });
  } catch (err) {
    console.error("Admin finance stats error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
