import { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import * as adminService from "@/shared/api/services/adminService";

type OwnerTimeRange = "30d" | "90d" | "12m";
type PlanKey = "FREE" | "PRO" | "VIP";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const PLAN_COLORS: Record<PlanKey, string> = {
  FREE: "#94a3b8",
  PRO: "#6366f1",
  VIP: "#f59e0b",
};

function getPlanPrice(plan: PlanKey): number {
  if (plan === "PRO") return 55_000;
  if (plan === "VIP") return 89_000;
  return 0;
}

export function AdminFinancePage() {
  const [ownerRange, setOwnerRange] = useState<OwnerTimeRange>("90d");
  const [monthlyFixedCost, setMonthlyFixedCost] = useState(15_000_000);
  const [cashReserve, setCashReserve] = useState(240_000_000);
  
  const [parents, setParents] = useState<adminService.ParentWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminService.getParents();
        setParents(data);
      } catch (err) {
        console.error("Failed to load parents for finance page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const students = parents.flatMap((p) => p.children);

  const planRevenueData = useMemo(() => {
    const seeds = {
      FREE: { plan: "FREE" as PlanKey, students: 0, revenue: 0 },
      PRO: { plan: "PRO" as PlanKey, students: 0, revenue: 0 },
      VIP: { plan: "VIP" as PlanKey, students: 0, revenue: 0 },
    };

    students.forEach((student) => {
      if (seeds[student.plan]) {
        seeds[student.plan].students += 1;
        seeds[student.plan].revenue += getPlanPrice(student.plan);
      }
    });

    return [seeds.FREE, seeds.PRO, seeds.VIP];
  }, [students]);

  const finance = useMemo(() => {
    const activePaid = students.filter(
      (s) => (s.plan === "PRO" || s.plan === "VIP") && s.status === "active",
    );
    const allPaid = students.filter(
      (s) => s.plan === "PRO" || s.plan === "VIP",
    );
    const atRisk = students.filter(
      (s) => (s.plan === "PRO" || s.plan === "VIP") && s.status !== "active",
    );

    const mrr = activePaid.reduce((sum, s) => sum + getPlanPrice(s.plan), 0);
    const arr = mrr * 12;
    const arppu =
      activePaid.length > 0 ? Math.round(mrr / activePaid.length) : 0;
    const churnRate =
      allPaid.length > 0 ? (atRisk.length / allPaid.length) * 100 : 0;
    const atRiskRevenue = atRisk.reduce(
      (sum, s) => sum + getPlanPrice(s.plan),
      0,
    );

    const rangeFactor: Record<OwnerTimeRange, number> = {
      "30d": 1,
      "90d": 3,
      "12m": 12,
    };
    const factor = rangeFactor[ownerRange];

    const estimatedMarketing = Math.round(mrr * 0.35) * factor;
    const estimatedNewPaid = Math.max(
      1,
      Math.round(activePaid.length * 0.2 * factor),
    );
    const cac = Math.round(estimatedMarketing / estimatedNewPaid);

    const grossMargin = 0.78;
    const churnMonthly = Math.max(churnRate / 100, 0.03);
    const ltv = Math.round((arppu * grossMargin) / churnMonthly);
    const payback = arppu > 0 ? cac / (arppu * grossMargin) : 0;

    const burn = Math.max(monthlyFixedCost - mrr, 0);
    const runway = burn > 0 ? cashReserve / burn : 99;

    return {
      mrr,
      arr,
      arppu,
      churnRate,
      atRiskRevenue,
      cac,
      ltv,
      payback,
      burn,
      runway,
      activePaid: activePaid.length,
      allPaid: allPaid.length,
    };
  }, [cashReserve, monthlyFixedCost, ownerRange, students]);

  const forecast = useMemo(() => {
    const base = finance.mrr;
    return ["T+0", "T+1", "T+2", "T+3", "T+4", "T+5"].map((month, i) => ({
      month,
      conservative: Math.round(base * Math.pow(1.04, i)),
      target: Math.round(base * Math.pow(1.08, i)),
      aggressive: Math.round(base * Math.pow(1.12, i)),
    }));
  }, [finance.mrr]);

  const bridgeData = [
    { label: "MRR hiện tại", value: finance.mrr },
    { label: "Rủi ro", value: -finance.atRiskRevenue },
    { label: "Mở rộng", value: Math.round(finance.mrr * 0.12) },
    { label: "MRR mục tiêu", value: Math.round(finance.mrr * 1.12) },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Đang tải dữ liệu tài chính...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Tài chính & Owner Mode
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Bảng điều khiển chuyên sâu để founder kiểm kê và dự báo dòng tiền.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <label className="text-xs font-semibold text-slate-600">
            Khung thời gian
          </label>
          <select
            value={ownerRange}
            onChange={(e) => setOwnerRange(e.target.value as OwnerTimeRange)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
            <option value="12m">12 tháng</option>
          </select>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <label className="text-xs font-semibold text-slate-600">
            Chi phí cố định / tháng (VND)
          </label>
          <input
            type="number"
            min={0}
            value={monthlyFixedCost}
            onChange={(e) => setMonthlyFixedCost(Number(e.target.value || 0))}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <label className="text-xs font-semibold text-slate-600">
            Tiền mặt dự trữ (VND)
          </label>
          <input
            type="number"
            min={0}
            value={cashReserve}
            onChange={(e) => setCashReserve(Number(e.target.value || 0))}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-emerald-700">
            MRR
          </p>
          <p className="text-xl font-extrabold text-emerald-800 mt-1">
            {VND.format(finance.mrr)}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-indigo-700">
            ARR
          </p>
          <p className="text-xl font-extrabold text-indigo-800 mt-1">
            {VND.format(finance.arr)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-amber-700">
            CAC / LTV
          </p>
          <p className="text-xl font-extrabold text-amber-800 mt-1">
            {VND.format(finance.cac)} / {VND.format(finance.ltv)}
          </p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-rose-700">
            Runway
          </p>
          <p className="text-xl font-extrabold text-rose-800 mt-1">
            {finance.runway >= 99 ? "∞" : `${finance.runway.toFixed(1)} tháng`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">
            Doanh thu theo gói
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={planRevenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="plan" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
              <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                {planRevenueData.map((row) => (
                  <Cell key={row.plan} fill={PLAN_COLORS[row.plan as PlanKey]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Revenue bridge</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bridgeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {bridgeData.map((row) => (
                  <Cell
                    key={row.label}
                    fill={row.value >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          Dự báo doanh thu 6 tháng
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ba kịch bản tăng trưởng để so sánh kế hoạch kinh doanh.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={forecast}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="conservative"
              name="Thận trọng (4%)"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Mục tiêu (8%)"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="aggressive"
              name="Tăng trưởng cao (12%)"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-slate-500">ARPPU</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {VND.format(finance.arppu)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Churn paid</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {finance.churnRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Revenue at risk</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {VND.format(finance.atRiskRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-slate-500">Payback</p>
            <p className="font-bold text-slate-800 mt-0.5">
              {finance.payback.toFixed(1)} tháng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
