import { useEffect, useMemo, useState } from "react";
import {
  getAnalyticsStats,
  type AnalyticsStats,
} from "@/shared/api/services/analyticsService";
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

const RANGE_OPTIONS = [
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 },
  { label: "90 ngày", value: 90 },
];

const DEVICE_META: Record<string, { label: string; color: string; icon: string }> = {
  desktop: { label: "Máy tính", color: "#6366f1", icon: "🖥️" },
  mobile: { label: "Điện thoại", color: "#22c55e", icon: "📱" },
  tablet: { label: "Máy tính bảng", color: "#f59e0b", icon: "📲" },
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

function formatDayLabel(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalyticsStats(days)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        console.error("Failed to load analytics stats:", err);
        if (!cancelled)
          setError("Không thể tải dữ liệu truy cập. Vui lòng thử lại sau.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const avgPerVisitor = useMemo(() => {
    if (!data || data.uniqueVisitors === 0) return 0;
    return Math.round((data.totalViews / data.uniqueVisitors) * 10) / 10;
  }, [data]);

  const dailyChart = useMemo(
    () =>
      (data?.dailyViews ?? []).map((d) => ({
        ...d,
        label: formatDayLabel(d.date),
      })),
    [data],
  );

  const deviceChart = useMemo(
    () =>
      (data?.deviceBreakdown ?? []).map((d) => ({
        name: DEVICE_META[d.device]?.label || d.device,
        value: d.count,
        device: d.device,
      })),
    [data],
  );

  /* ── Loading / Error ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-semibold">
        <svg className="animate-spin h-6 w-6 mr-3 text-indigo-500" viewBox="0 0 24 24">
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
        Đang tải dữ liệu truy cập...
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

  const isEmpty = data.totalViews === 0;

  const statCards = [
    {
      label: "Lượt xem trang",
      value: formatCompact(data.totalViews),
      sub: `${data.viewsToday} lượt hôm nay`,
      icon: "👁️",
      color: "border-indigo-200",
    },
    {
      label: "Khách duy nhất",
      value: formatCompact(data.uniqueVisitors),
      sub: `${avgPerVisitor} trang / khách`,
      icon: "🧑",
      color: "border-emerald-200",
    },
    {
      label: "Phiên truy cập",
      value: formatCompact(data.totalSessions),
      sub: `Trong ${data.rangeDays} ngày`,
      icon: "🔁",
      color: "border-amber-200",
    },
    {
      label: "Lượt xem hôm nay",
      value: formatCompact(data.viewsToday),
      sub: "Tính từ 00:00",
      icon: "📅",
      color: "border-sky-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            Web Analytics
          </p>
          <h2 className="text-2xl font-extrabold mt-1">Lượt truy cập website</h2>
          <p className="text-sm text-cyan-100 mt-1">
            Dữ liệu thu thập trực tiếp từ người dùng (không tính khu vực admin)
          </p>
        </div>
        <div className="flex gap-1 bg-white/15 rounded-xl p-1 self-start">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                days === opt.value
                  ? "bg-white text-indigo-700"
                  : "text-white hover:bg-white/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          Chưa có lượt truy cập nào được ghi nhận. Hãy đảm bảo đã chạy{" "}
          <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">/api/admin/init-db</code>{" "}
          để tạo bảng, sau đó truy cập vài trang công khai (trang chủ, đăng nhập...) để có dữ liệu.
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${card.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Daily traffic + Devices ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            📈 Lượt truy cập theo ngày
          </h3>
          {dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => formatCompact(v)}
                  allowDecimals={false}
                />
                <Tooltip
                  labelStyle={{ fontWeight: 700 }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value: number | undefined, name) => [
                    value ?? 0,
                    name === "views" ? "Lượt xem" : "Khách",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="views"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#viewsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="visitors"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#visitorsGradient)"
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-600 font-medium">
                      {value === "views" ? "Lượt xem" : "Khách duy nhất"}
                    </span>
                  )}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">📱 Thiết bị</h3>
          {deviceChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={deviceChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deviceChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DEVICE_META[entry.device]?.color || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    formatter={(value: number | undefined) => [value ?? 0, "Lượt xem"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.deviceBreakdown.map((d) => (
                  <div
                    key={d.device}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: DEVICE_META[d.device]?.color || "#94a3b8",
                        }}
                      />
                      <span className="font-bold text-slate-700">
                        {DEVICE_META[d.device]?.icon} {DEVICE_META[d.device]?.label || d.device}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {d.count} lượt ·{" "}
                      {Math.round((d.count / Math.max(data.totalViews, 1)) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* ── Top pages + Referrers ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            🏆 Trang được xem nhiều nhất
          </h3>
          {data.topPages.length > 0 ? (
            <div className="space-y-2.5">
              {data.topPages.map((p, i) => {
                const pct = Math.round(
                  (p.views / Math.max(data.topPages[0].views, 1)) * 100,
                );
                return (
                  <div key={p.path}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 truncate max-w-[70%]">
                        <span className="text-slate-400 mr-1.5">{i + 1}.</span>
                        {p.path}
                      </span>
                      <span className="text-slate-500 font-bold">{p.views}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            🔗 Nguồn truy cập
          </h3>
          {data.topReferrers.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(data.topReferrers.length * 38, 160)}>
              <BarChart
                data={data.topReferrers}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="referrer"
                  width={120}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(value: number | undefined) => [value ?? 0, "Lượt"]}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
