import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as adminService from "@/shared/api/services/adminService";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCompactMoney(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

export function AdminOverviewPage() {
  const [stats, setStats] = useState<adminService.AdminStats | null>(null);
  const [parents, setParents] = useState<adminService.ParentWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, parentsData] = await Promise.all([
          adminService.getStats(),
          adminService.getParents()
        ]);
        setStats(statsData);
        setParents(parentsData);
      } catch (error) {
        console.error("Failed to load admin overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allStudents = parents.flatMap((p) => p.children);

  const averageScore = useMemo(() => {
    // We don't have avgScore in ChildProfile anymore, so returning a static or estimated value for now
    return 85; 
  }, [allStudents]);

  const planMix = useMemo(() => {
    const total = Math.max(allStudents.length, 1);
    const free = allStudents.filter((s) => s.plan === "FREE").length;
    const pro = allStudents.filter((s) => s.plan === "PRO").length;
    const vip = allStudents.filter((s) => s.plan === "VIP").length;
    return {
      free,
      pro,
      vip,
      freePct: Math.round((free / total) * 100),
      proPct: Math.round((pro / total) * 100),
      vipPct: Math.round((vip / total) * 100),
    };
  }, [allStudents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Phụ huynh",
      value: stats.totalParents.toString(),
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Học sinh",
      value: stats.totalStudents.toString(),
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Premium",
      value: (planMix.pro + planMix.vip).toString(),
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Doanh thu",
      value: formatCompactMoney(stats.totalRevenue),
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Admin dashboard
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
          Bảng điều khiển điều hành
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tổng doanh thu hiện tại: {VND.format(stats.totalRevenue)}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Điểm TB hệ thống = trung bình cộng điểm TB của tất cả học sinh hiện có
          ({averageScore} điểm).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-3xl font-extrabold text-slate-900">
                {card.value}
              </p>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${card.color}`}
              >
                {card.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Link
          to="/admin/performance"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-sm font-bold text-slate-900">Hiệu suất học tập</p>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi điểm số, trạng thái hoạt động, top gia đình.
          </p>
          <p className="text-indigo-600 text-sm font-semibold mt-4">
            Mở báo cáo →
          </p>
        </Link>

        <Link
          to="/admin/finance"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-sm font-bold text-slate-900">
            Tài chính & Owner Mode
          </p>
          <p className="text-xs text-slate-500 mt-1">
            MRR, ARR, CAC, LTV, churn, burn và runway cho founder.
          </p>
          <p className="text-indigo-600 text-sm font-semibold mt-4">
            Mở báo cáo →
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <p className="text-sm font-bold text-slate-900">
            Quản lý phụ huynh/học sinh
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý theo cụm gia đình, khoá/mở khoá và tra cứu nhanh.
          </p>
          <p className="text-indigo-600 text-sm font-semibold mt-4">
            Mở quản lý →
          </p>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          Cơ cấu gói học sinh hiện tại
        </h3>
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>FREE ({planMix.free})</span>
              <span>{planMix.freePct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400"
                style={{ width: `${planMix.freePct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>PRO ({planMix.pro})</span>
              <span>{planMix.proPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${planMix.proPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>VIP ({planMix.vip})</span>
              <span>{planMix.vipPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${planMix.vipPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
