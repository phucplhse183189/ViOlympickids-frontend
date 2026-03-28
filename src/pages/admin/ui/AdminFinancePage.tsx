import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { financeWorkbookData } from "@/shared/data/finance/financeWorkbookData";
import { useInView } from "@/shared/lib/useInView";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const VND_COMPACT = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const INTEGER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

function compactCurrency(value: number): string {
  if (value === 0) return "0 đ";
  return `${VND_COMPACT.format(value)} đ`;
}

function formatMetricValue(metricName: string, value: number): string {
  if (metricName.includes("%")) return `${value.toFixed(1)}%`;
  const normalized = metricName.toLowerCase();
  if (normalized.includes("customer") || normalized.includes("users")) {
    return INTEGER.format(value);
  }
  return VND.format(value);
}

function formatDeltaPercent(current: number, previous: number | null): string {
  if (!previous || previous === 0) return "N/A";
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={`${className || ""} transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export function AdminFinancePage() {
  const monthOptions = financeWorkbookData.monthlySeries.map((row) => row.month);
  const [selectedMonth, setSelectedMonth] = useState<string>(financeWorkbookData.latestMonth);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-finance-dark-mode");
    if (saved) {
      setIsDarkMode(saved === "1");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-finance-dark-mode", isDarkMode ? "1" : "0");
  }, [isDarkMode]);

  const selected = useMemo(() => {
    return (
      financeWorkbookData.monthlySeries.find((row) => row.month === selectedMonth) ||
      financeWorkbookData.monthlySeries[financeWorkbookData.monthlySeries.length - 1]
    );
  }, [selectedMonth]);

  const selectedIndex = useMemo(() => {
    return financeWorkbookData.monthlySeries.findIndex((row) => row.month === selected.month);
  }, [selected.month]);

  const previous = selectedIndex > 0 ? financeWorkbookData.monthlySeries[selectedIndex - 1] : null;

  const trend12 = useMemo(() => {
    return financeWorkbookData.monthlySeries.slice(-12);
  }, []);

  const bridgeData = [
    { label: "Revenue", value: selected.revenue },
    { label: "COGS", value: -selected.cogs },
    { label: "OpEx", value: -selected.opex },
    { label: "EBITDA", value: selected.ebitda },
  ];

  const cogsBreakdown =
    financeWorkbookData.cogsBreakdownByMonth.find((row) => row.month === selected.month)?.items || [];

  const opexBreakdown =
    financeWorkbookData.opexBreakdownByMonth.find((row) => row.month === selected.month)?.items || [];

  const valuationRows = financeWorkbookData.valuation.metrics;

  const kpiMonthIndex = useMemo(() => {
    const index = financeWorkbookData.kpiMetricTable.headers.findIndex((month) => month === selected.month);
    return index >= 0 ? index : financeWorkbookData.kpiMetricTable.headers.length - 1;
  }, [selected.month]);

  const pnlMonthIndex = useMemo(() => {
    const index = financeWorkbookData.pnlMetricTable.headers.findIndex((month) => month === selected.month);
    return index >= 0 ? index : financeWorkbookData.pnlMetricTable.headers.length - 1;
  }, [selected.month]);

  const kpiSnapshotRows = financeWorkbookData.kpiMetricTable.rows
    .map((row) => ({
      metric: row.metric,
      value: row.values[kpiMonthIndex] ?? 0,
    }))
    .filter((row) => Number.isFinite(row.value));

  const pnlSnapshotRows = financeWorkbookData.pnlMetricTable.rows
    .map((row) => ({
      lineItem: row.lineItem,
      value: row.values[pnlMonthIndex] ?? 0,
    }))
    .filter((row) => Number.isFinite(row.value));

  const cogsTotal = cogsBreakdown.reduce((sum, row) => sum + row.value, 0);
  const opexTotal = opexBreakdown.reduce((sum, row) => sum + row.value, 0);

  const exportSelectedMonthPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const { exportFinanceMonthPdf } = await import("./lib/exportFinancePdf");
      await exportFinanceMonthPdf({
        selected,
        cogsBreakdown,
        opexBreakdown,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const panelClass = isDarkMode
    ? "border-slate-700 bg-slate-900/80 text-slate-100 shadow-[0_10px_35px_-18px_rgba(15,23,42,0.9)]"
    : "border-slate-200 bg-white text-slate-900 shadow-sm";
  const softTextClass = isDarkMode ? "text-slate-300" : "text-slate-600";
  const tableHeaderClass = isDarkMode
    ? "border-slate-700 text-slate-400 bg-slate-900/95"
    : "border-slate-200 text-slate-500 bg-white/95";

  return (
    <div
      className={`relative space-y-6 overflow-hidden rounded-3xl border p-4 font-['Poppins','Nunito_Sans',sans-serif] md:p-6 ${
        isDarkMode
          ? "border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 text-slate-100"
          : "border-slate-200/70 bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/40 text-slate-900"
      }`}
    >
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <RevealSection>
      <section className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur ${isDarkMode ? "border-slate-700 bg-slate-900/70 shadow-[0_10px_35px_-16px_rgba(2,132,199,0.2)]" : "border-white/70 bg-white/80 shadow-[0_10px_35px_-16px_rgba(2,132,199,0.45)]"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%)]" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">Owner Finance Intelligence</p>
            <h2 className={`mt-2 text-3xl font-black md:text-4xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Tài chính & Owner Mode</h2>
            <p className={`mt-2 max-w-3xl text-sm ${softTextClass}`}>
              Dashboard đã tối ưu theo style điều hành: trực quan, nhanh đọc và bám 100% dữ liệu từ
              file Bang-Finace-new.xlsx.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">
                {financeWorkbookData.sheetCount} sheets synced
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                Latest month: {selected.month}
              </span>
            </div>
          </div>

          <div className={`w-full rounded-2xl border p-4 lg:w-[300px] ${isDarkMode ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white/90"}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Kỳ đang xem</p>
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isDarkMode ? "Light" : "Dark"}
              </button>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm font-semibold outline-none ring-cyan-300 transition focus:ring ${
                isDarkMode
                  ? "border-slate-600 bg-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <p className={`mt-2 text-xs ${softTextClass}`}>
              Revenue MoM: {formatDeltaPercent(selected.revenue, previous?.revenue ?? null)}
            </p>
            <button
              type="button"
              onClick={exportSelectedMonthPdf}
              disabled={isExportingPdf}
              className="mt-3 w-full rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingPdf ? "Đang tạo PDF..." : `Export PDF tháng ${selected.month}`}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          {financeWorkbookData.sheets.map((sheet) => (
            <span key={sheet} className={`rounded-full border px-3 py-1 text-[11px] font-medium ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
              {sheet}
            </span>
          ))}
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Revenue",
            value: VND.format(selected.revenue),
            note: `MoM: ${formatDeltaPercent(selected.revenue, previous?.revenue ?? null)}`,
            tone: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
          },
          {
            title: "MRR / ARR",
            value: compactCurrency(selected.mrr),
            note: `ARR: ${compactCurrency(selected.arrRunRate)}`,
            tone: "border-sky-200 bg-sky-50/90 text-sky-900",
          },
          {
            title: "Gross Margin",
            value: `${selected.grossMarginPct.toFixed(1)}%`,
            note: `COGS: ${compactCurrency(selected.cogs)}`,
            tone: "border-amber-200 bg-amber-50/90 text-amber-900",
          },
          {
            title: "EBITDA / Burn",
            value: VND.format(selected.ebitda),
            note: `Burn: ${compactCurrency(selected.burnProxy)}`,
            tone: "border-rose-200 bg-rose-50/90 text-rose-900",
          },
        ].map((card) => (
          <article key={card.title} className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{card.title}</p>
            <p className="mt-1 text-2xl font-black">{card.value}</p>
            <p className="mt-1 text-xs opacity-80">{card.note}</p>
          </article>
        ))}
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">Revenue vs MRR (12 tháng gần nhất)</h3>
          <p className={`mt-1 text-xs ${softTextClass}`}>Xu hướng tăng trưởng subscription và doanh thu</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend12}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`} />
              <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0284c7" fill="url(#revenueFill)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="#14b8a6" dot={false} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">P&L Bridge ({selected.month})</h3>
          <p className={`mt-1 text-xs ${softTextClass}`}>Revenue - COGS - OpEx = EBITDA</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bridgeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`} />
              <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {bridgeData.map((row) => (
                  <Cell key={row.label} fill={row.value >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`rounded-2xl border p-4 xl:col-span-2 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">EBITDA, Net Income, Active Customers</h3>
          <p className={`mt-1 text-xs ${softTextClass}`}>Tracking hiệu quả vận hành và quy mô người dùng</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="money" axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`} />
              <YAxis yAxisId="users" orientation="right" axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <Tooltip formatter={(v) => VND.format(Number(v ?? 0))} />
              <Legend />
              <Line yAxisId="money" type="monotone" dataKey="ebitda" name="EBITDA" stroke="#16a34a" strokeWidth={2.5} dot={false} />
              <Line yAxisId="money" type="monotone" dataKey="netIncome" name="Net income" stroke="#0f766e" strokeWidth={2.2} dot={false} />
              <Line yAxisId="users" type="monotone" dataKey="activeCustomers" name="Active customers" stroke="#0ea5e9" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">Assumptions</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Start month</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.startDateMonth}</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Forecast</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.forecastMonths} tháng</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Model</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.revenueModel}</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Scenario</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.scenario}</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Tax</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.taxRate}</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Benefits</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.benefitsRate}</span></p>
            <p className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5"><span>Employer taxes</span><span className="font-semibold">{financeWorkbookData.generalAssumptions.employerTaxesRate}</span></p>
          </div>
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">COGS Breakdown ({selected.month})</h3>
          <div className="mt-3 space-y-2">
            {cogsBreakdown.map((row) => {
              const ratio = cogsTotal > 0 ? (row.value / cogsTotal) * 100 : 0;
              return (
                <div key={row.item} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{row.item}</span>
                    <span className="font-bold text-slate-900">{VND.format(row.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(ratio, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">OpEx Breakdown ({selected.month})</h3>
          <div className="mt-3 space-y-2">
            {opexBreakdown.map((row) => {
              const ratio = opexTotal > 0 ? (row.value / opexTotal) * 100 : 0;
              return (
                <div key={row.item} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{row.item}</span>
                    <span className="font-bold text-slate-900">{VND.format(row.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(ratio, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">Pricing (Assumptions)</h3>
          <div className="mt-3 space-y-2">
            {financeWorkbookData.pricing.map((row) => (
              <div key={row.plan} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.plan}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Tháng: {VND.format(row.monthly)}</p>
                <p className="text-xs text-slate-600">3 tháng: {VND.format(row.quarterly)}</p>
                <p className="text-xs text-slate-600">Năm: {VND.format(row.yearly)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 xl:col-span-2 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">Valuation (2026-2028)</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 backdrop-blur">
                <tr className={`border-b text-left text-xs uppercase tracking-wide ${tableHeaderClass}`}>
                  <th className="pb-2 pr-3">Metric</th>
                  {financeWorkbookData.valuation.years.map((year) => (
                    <th key={year} className="pb-2 pr-3">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {valuationRows.map((row) => (
                  <tr key={row.metric} className={`border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <td className={`py-2 pr-3 font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{row.metric}</td>
                    {row.values.map((value, i) => (
                      <td key={`${row.metric}-${i}`} className={`py-2 pr-3 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {typeof value === "number" && Number.isFinite(value)
                          ? formatMetricValue(row.metric, value)
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className={`rounded-2xl border p-4 ${panelClass}`}>
        <h3 className="text-sm font-bold text-slate-900">Fundraising & Ownership</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {financeWorkbookData.fundraising.map((item) => (
            <div key={item.item} className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-3 py-2">
              <p className="text-xs text-slate-500">{item.item}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">KPI Snapshot ({selected.month})</h3>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
            {kpiSnapshotRows.map((row) => (
              <div key={row.metric} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">{row.metric}</span>
                <span className="font-semibold text-slate-900">{formatMetricValue(row.metric, row.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${panelClass}`}>
          <h3 className="text-sm font-bold text-slate-900">P&L Snapshot ({selected.month})</h3>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
            {pnlSnapshotRows.map((row) => (
              <div key={row.lineItem} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">{row.lineItem}</span>
                <span className="font-semibold text-slate-900">{formatMetricValue(row.lineItem, row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </RevealSection>

      <RevealSection>
      <section className={`rounded-2xl border p-4 ${panelClass}`}>
        <h3 className="text-sm font-bold text-slate-900">Bảng chỉ số tài chính 36 tháng</h3>
        <p className={`mt-1 text-xs ${softTextClass}`}>Tổng hợp theo tháng từ KPIs + PnL trong file Excel.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[1100px] text-sm">
            <thead className="sticky top-0 backdrop-blur">
              <tr className={`border-b text-left text-xs uppercase tracking-wide ${tableHeaderClass}`}>
                <th className="pb-2 pr-3">Month</th>
                <th className="pb-2 pr-3">Revenue</th>
                <th className="pb-2 pr-3">MRR</th>
                <th className="pb-2 pr-3">ARR</th>
                <th className="pb-2 pr-3">COGS</th>
                <th className="pb-2 pr-3">OpEx</th>
                <th className="pb-2 pr-3">Gross Margin</th>
                <th className="pb-2 pr-3">EBITDA</th>
                <th className="pb-2 pr-3">Net Income</th>
                <th className="pb-2 pr-3">Active Customers</th>
                <th className="pb-2 pr-3">Burn</th>
              </tr>
            </thead>
            <tbody>
              {financeWorkbookData.monthlySeries.map((row) => (
                <tr key={row.month} className={`border-b transition ${isDarkMode ? "border-slate-800 hover:bg-slate-800/40" : "border-slate-100 hover:bg-slate-50/70"}`}>
                  <td className={`py-2 pr-3 font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>{row.month}</td>
                  <td className="py-2 pr-3">{VND.format(row.revenue)}</td>
                  <td className="py-2 pr-3">{VND.format(row.mrr)}</td>
                  <td className="py-2 pr-3">{VND.format(row.arrRunRate)}</td>
                  <td className="py-2 pr-3">{VND.format(row.cogs)}</td>
                  <td className="py-2 pr-3">{VND.format(row.opex)}</td>
                  <td className="py-2 pr-3">{row.grossMarginPct.toFixed(1)}%</td>
                  <td className="py-2 pr-3">{VND.format(row.ebitda)}</td>
                  <td className="py-2 pr-3">{VND.format(row.netIncome)}</td>
                  <td className="py-2 pr-3">{INTEGER.format(row.activeCustomers)}</td>
                  <td className="py-2 pr-3">{VND.format(row.burnProxy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </RevealSection>
    </div>
  );
}
