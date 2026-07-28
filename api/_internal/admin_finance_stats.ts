import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, count, sum, sql, desc, and, lt } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/finance-stats
 * Thống kê tài chính thực tế từ DB:
 *   - Tổng doanh thu, số giao dịch
 *   - Doanh thu theo tháng (12 tháng gần nhất)
 *   - Phân loại theo gói (PRO/VIP)
 *   - Giao dịch gần đây nhất
 *   - Thống kê PayOS + chi tiết đơn hàng (kèm tên phụ huynh + tên bé)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ── Auto-cancel: đơn PENDING quá 30 phút → CANCELLED ──────────────
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await db
      .update(schema.paymentOrders)
      .set({ status: "CANCELLED" })
      .where(
        and(
          eq(schema.paymentOrders.status, "PENDING"),
          lt(schema.paymentOrders.createdAt, thirtyMinutesAgo)
        )
      );

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
      recentPaymentOrdersResult,
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

      // 10 đơn hàng PayOS gần nhất — kèm tên phụ huynh + tên bé
      db
        .select({
          id: schema.paymentOrders.id,
          orderCode: schema.paymentOrders.orderCode,
          plan: schema.paymentOrders.plan,
          cycle: schema.paymentOrders.cycle,
          amount: schema.paymentOrders.amount,
          status: schema.paymentOrders.status,
          createdAt: schema.paymentOrders.createdAt,
          paidAt: schema.paymentOrders.paidAt,
          parentName: schema.users.name,
          parentPhone: schema.users.phone,
          childName: schema.children.name,
          childEmoji: schema.children.avatarEmoji,
        })
        .from(schema.paymentOrders)
        .leftJoin(schema.users, eq(schema.paymentOrders.parentId, schema.users.id))
        .leftJoin(schema.children, eq(schema.paymentOrders.childId, schema.children.id))
        .orderBy(desc(schema.paymentOrders.createdAt))
        .limit(10),
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

    // PayOS recent orders (kèm thông tin phụ huynh + bé)
    const recentPaymentOrders = (recentPaymentOrdersResult || []).map((o) => {
      // Thời hạn của dòng lịch sử phải thuộc về chính đơn hàng, không lấy
      // children.planDaysLeft stores the remaining duration of the current paid plan.
      const entitlementDays = o.cycle === "year" ? 365 : 30;
      const paidAtMs = o.paidAt ? new Date(o.paidAt).getTime() : NaN;
      const expiresAtMs = paidAtMs + entitlementDays * 24 * 60 * 60 * 1000;
      const orderDaysRemaining = Number.isFinite(expiresAtMs)
        ? Math.max(0, Math.ceil((expiresAtMs - Date.now()) / (24 * 60 * 60 * 1000)))
        : null;

      return ({
      id: o.id,
      orderCode: o.orderCode,
      plan: o.plan,
      cycle: o.cycle,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      parentName: o.parentName || "Không rõ",
      parentPhone: o.parentPhone || null,
      childName: o.childName || "Không rõ",
      childEmoji: o.childEmoji || "👶",
        planDaysLeft: o.status === "PAID" ? orderDaysRemaining : null,
      });
    });

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
      recentPaymentOrders,
    });
  } catch (err) {
    console.error("Admin finance stats error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
