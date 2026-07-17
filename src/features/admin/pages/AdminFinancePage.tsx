import { useEffect, useMemo, useState } from "react";
import * as adminService from "@/features/admin/api/adminService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── Helpers ────────────────────────────────────────────────────────────── */

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

const PLAN_COLORS: Record<string, string> = {
  PRO: "#6366f1",
  VIP: "#f59e0b",
  FREE: "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PAID: "#22c55e",
  CANCELLED: "#ef4444",
};

/* ── Main Component ─────────────────────────────────────────────────────── */

export function AdminFinancePage() {
  const [data, setData] = useState<adminService.FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService
      .getFinanceStats()
      .then(setData)
      .catch((err) => {
        console.error("Failed to load finance stats:", err);
        setError("Không thể tải dữ liệu tài chính. Vui lòng thử lại sau.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* derived */
  const successRate = useMemo(() => {
    if (!data || data.totalTransactions === 0) return 0;
    return Math.round(
      (data.successTransactions / data.totalTransactions) * 100,
    );
  }, [data]);

  const arr = useMemo(() => (data ? data.mrr * 12 : 0), [data]);

  /* ── Loading / Error ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-semibold">
        <svg
          className="animate-spin h-6 w-6 mr-3 text-indigo-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Đang tải dữ liệu tài chính...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-rose-500 font-semibold">{error || "Lỗi không xác định"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  /* ── Stat cards ──────────────────────────────────────────────────────── */
  const statCards = [
    {
      label: "Tổng doanh thu",
      value: VND.format(data.totalRevenue),
      sub: `${data.successTransactions} giao dịch thành công`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "💰",
    },
    {
      label: "MRR",
      value: VND.format(data.mrr),
      sub: `ARR: ${formatCompact(arr)}`,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: "📈",
    },
    {
      label: "Học sinh trả phí",
      value: data.activeSubscriptions.toString(),
      sub: "PRO + VIP đang hoạt động",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "👑",
    },
    {
      label: "Tỉ lệ thành công",
      value: `${successRate}%`,
      sub: `${data.failedTransactions} thất bại / ${data.totalTransactions} tổng`,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      icon: "✅",
    },
  ];

  /* ── Pie data ────────────────────────────────────────────────────────── */
  const pieData =
    data.planBreakdown.length > 0
      ? data.planBreakdown.map((p) => ({
          name: `Gói ${p.plan}`,
          value: p.revenue,
          plan: p.plan,
          count: p.count,
        }))
      : [{ name: "Chưa có dữ liệu", value: 1, plan: "FREE", count: 0 }];

  /* ── PayOS status data for bar chart ──────────────────────────────── */
  const payosData = data.paymentOrdersStats.map((s) => ({
    name:
      s.status === "PAID"
        ? "Đã thanh toán"
        : s.status === "PENDING"
          ? "Chờ xử lý"
          : "Đã hủy",
    count: s.count,
    total: s.total,
    status: s.status,
  }));

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
          Tài chính thực tế
        </p>
        <h2 className="text-2xl font-extrabold mt-1">
          Báo cáo doanh thu & giao dịch
        </h2>
        <p className="text-sm text-indigo-100 mt-1">
          Dữ liệu được lấy trực tiếp từ cơ sở dữ liệu hệ thống
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${card.color.split(" ").slice(2).join(" ") || "border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {card.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Trend (Area Chart) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            📊 Doanh thu theo tháng
          </h3>
          {data.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip
                  formatter={(value: number | undefined) => [VND.format(value ?? 0), "Doanh thu"]}
                  labelStyle={{ fontWeight: 700 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Plan Breakdown (Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            🎯 Doanh thu theo gói
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PLAN_COLORS[entry.plan] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => VND.format(value ?? 0)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => (
                  <span className="text-slate-600 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Plan stats below chart */}
          <div className="space-y-2 mt-2">
            {data.planBreakdown.map((p) => (
              <div
                key={p.plan}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: PLAN_COLORS[p.plan] || "#94a3b8",
                    }}
                  />
                  <span className="font-bold text-slate-700">{p.plan}</span>
                </div>
                <span className="text-slate-500">
                  {p.count} lượt · {VND.format(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PayOS Orders ──────────────────────────────────────────────── */}
      {payosData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            💳 Thống kê đơn hàng PayOS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="count" name="Số đơn" radius={[6, 6, 0, 0]}>
                  {payosData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex flex-col justify-center">
              {payosData.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[s.status] || "#94a3b8",
                      }}
                    />
                    <span className="text-sm font-bold text-slate-700">
                      {s.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      {s.count} đơn
                    </p>
                    <p className="text-xs text-slate-500">
                      {VND.format(s.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chi tiết đơn PayOS (kèm phụ huynh + bé) ─────────────────── */}
      {data.recentPaymentOrders && data.recentPaymentOrders.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            📋 Chi tiết đơn hàng PayOS
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Phụ huynh
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Bé
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Gói
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Số tiền
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentPaymentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">
                          {order.parentName}
                        </span>
                        {order.parentPhone && (
                          <span className="text-xs text-slate-400">
                            {order.parentPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{order.childEmoji}</span>
                        <span className="font-medium text-slate-700 text-sm">
                          {order.childName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.plan === "VIP"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {order.plan === "VIP" ? "👑 " : "⚡ "}
                        {order.plan}{" "}
                        <span className="font-normal ml-1 text-slate-400">
                          ({order.cycle === "year" ? "Năm" : "Tháng"})
                        </span>
                      </span>
                      {order.status === "PAID" && order.planDaysLeft != null && (
                        <div className="text-[11px] font-semibold text-slate-500 mt-1">
                          Còn {order.planDaysLeft} ngày
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {VND.format(order.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {order.status === "PAID"
                          ? "✅ Đã thanh toán"
                          : order.status === "PENDING"
                            ? "⏳ Chờ xử lý"
                            : "❌ Đã hủy"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      <div>
                        {new Date((order.status === "PAID" && order.paidAt) ? order.paidAt : order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-slate-400">
                        {new Date((order.status === "PAID" && order.paidAt) ? order.paidAt : order.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Transactions ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          🕐 Giao dịch gần đây
        </h3>
        {data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Ngày
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Số tiền
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Phương thức
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {VND.format(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{tx.method}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          tx.status === "Thành công"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Chưa có giao dịch nào
          </div>
        )}
      </div>

      {/* ── Transaction Metrics Summary ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Giao dịch trung bình
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {data.successTransactions > 0
              ? VND.format(
                  Math.round(data.totalRevenue / data.successTransactions),
                )
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Giá trị TB / giao dịch thành công
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            LTV ước tính
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {data.activeSubscriptions > 0
              ? VND.format(
                  Math.round(data.totalRevenue / data.activeSubscriptions),
                )
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Doanh thu / Học sinh trả phí
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            ARPU
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {data.activeSubscriptions > 0
              ? VND.format(
                  Math.round(data.mrr / data.activeSubscriptions),
                )
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            MRR / Học sinh trả phí
          </p>
        </div>
      </div>
    </div>
  );
}
