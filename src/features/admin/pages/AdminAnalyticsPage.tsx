import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AdminPageLoading } from "@/features/admin/components/ui";
import {
  Activity,
  CalendarDays,
  Eye,
  Globe2,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Route,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminAnalyticsQuery } from "@/features/admin/api/adminQueries";

const ranges = [{ label: "7 ngày", value: 7 }, { label: "30 ngày", value: 30 }, { label: "90 ngày", value: 90 }];
const refreshMs = 30_000;
const sectionMotion = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const tooltipStyle = { borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)", boxShadow: "0 12px 30px rgb(0 0 0 / .12)" };
const devices: Record<string, { label: string; color: string; icon: string }> = {
  desktop: { label: "Máy tính", color: "#6366f1", icon: "🖥️" },
  mobile: { label: "Điện thoại", color: "#10b981", icon: "📱" },
  tablet: { label: "Máy tính bảng", color: "#f59e0b", icon: "📲" },
};
const compact = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });

export function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const reduceMotion = useReducedMotion();
  const query = useAdminAnalyticsQuery(days);
  const { data, isPending, isFetching, refetch, dataUpdatedAt } = query;
  const transition = reduceMotion ? { duration: 0 } : { duration: .42, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refetch(); }, refreshMs);
    return () => window.clearInterval(timer);
  }, [autoRefresh, refetch]);

  const dailyData = useMemo(() => (data?.dailyViews || []).map((item) => ({ ...item, label: formatDate(item.date) })), [data]);
  const deviceData = useMemo(() => (data?.deviceBreakdown || []).map((item) => ({ ...item, name: devices[item.device]?.label || item.device, value: item.count })), [data]);
  const pagesPerVisitor = data?.uniqueVisitors ? Math.round((data.totalViews / data.uniqueVisitors) * 10) / 10 : 0;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  if (isPending) return <AnalyticsSkeleton />;
  if (query.error || !data) return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center font-semibold text-rose-500">Không thể tải dữ liệu truy cập. Vui lòng thử lại.</div>;

  const kpis = [
    { label: "Lượt xem trang", value: compact.format(data.totalViews), note: `${data.viewsToday} lượt hôm nay`, icon: Eye, style: "bg-indigo-500/10 text-indigo-500" },
    { label: "Khách duy nhất", value: compact.format(data.uniqueVisitors), note: `${pagesPerVisitor} trang / khách`, icon: Users, style: "bg-emerald-500/10 text-emerald-500" },
    { label: "Phiên truy cập", value: compact.format(data.totalSessions), note: `Trong ${data.rangeDays} ngày`, icon: Route, style: "bg-violet-500/10 text-violet-500" },
    { label: "Lượt xem hôm nay", value: compact.format(data.viewsToday), note: "Tính từ 00:00", icon: CalendarDays, style: "bg-cyan-500/10 text-cyan-500" },
  ];

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: reduceMotion ? 0 : .065 }} className="space-y-6 pb-8">
      <motion.section variants={sectionMotion} transition={transition} className="relative isolate overflow-hidden rounded-[28px] border border-sky-400/20 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-sky-950/10 md:px-8 md:py-9">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(14,165,233,.34),transparent_35%),radial-gradient(circle_at_88%_80%,rgba(99,102,241,.34),transparent_32%)]" />
        <motion.div aria-hidden className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-100"><Globe2 className="h-3.5 w-3.5" /> Traffic intelligence</div><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Biết người dùng đến từ đâu.<br className="hidden sm:block" /> Hiểu họ quan tâm điều gì.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Phân tích hành vi truy cập công khai theo thời gian thực, không bao gồm lưu lượng khu vực quản trị.</p></div>
          <div className="space-y-3 xl:min-w-[400px]">
            <div className="flex rounded-2xl border border-white/10 bg-white/10 p-1.5 backdrop-blur">{ranges.map((range) => <button key={range.value} onClick={() => setDays(range.value)} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all ${days === range.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>{range.label}</button>)}</div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[.07] p-2.5 pl-3"><span className="flex items-center gap-2 text-xs text-slate-300"><span className={`h-2 w-2 rounded-full ${autoRefresh ? "animate-pulse bg-emerald-300" : "bg-slate-500"}`} />{lastUpdated ? `Cập nhật ${lastUpdated.toLocaleTimeString("vi-VN")}` : "Đang chờ dữ liệu"}</span><div className="flex gap-2"><button onClick={() => setAutoRefresh((value) => !value)} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-white/15">Tự động: {autoRefresh ? "BẬT" : "TẮT"}</button><button onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-900 disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />Làm mới</button></div></div>
          </div>
        </div>
      </motion.section>

      {data.totalViews === 0 && <motion.div variants={sectionMotion} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">Chưa ghi nhận lượt truy cập công khai trong khoảng thời gian này.</motion.div>}

      <motion.section variants={sectionMotion} transition={transition}>
        <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Tổng quan nhanh</p><h3 className="mt-1 text-xl font-bold text-foreground">Sức khỏe lưu lượng</h3></div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-4">{kpis.map((item, index) => <motion.article key={item.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay: index * .05 }} whileHover={reduceMotion ? undefined : { y: -4 }} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{item.label}</p><p className="mt-3 text-3xl font-extrabold tracking-tight">{item.value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.style}`}><item.icon className="h-5 w-5" /></span></div><p className="mt-4 text-xs font-medium text-muted-foreground">{item.note}</p></motion.article>)}</div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Panel title="Lưu lượng theo ngày" subtitle="Lượt xem và khách duy nhất" icon={Activity} transition={transition}><div className="h-[330px]">{dailyData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyData} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="analyticsViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={.38} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient><linearGradient id="analyticsVisitors" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.22} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tickFormatter={(value) => compact.format(value)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={46} /><Tooltip formatter={(value, name) => [value, name === "views" ? "Lượt xem" : "Khách"]} contentStyle={tooltipStyle} /><Legend formatter={(value) => value === "views" ? "Lượt xem" : "Khách duy nhất"} wrapperStyle={{ fontSize: 12 }} /><Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fill="url(#analyticsViews)" /><Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2.5} fill="url(#analyticsVisitors)" /></AreaChart></ResponsiveContainer> : <EmptyState />}</div></Panel>
        <Panel title="Thiết bị" subtitle="Phân bổ lượt xem theo nền tảng" icon={MonitorSmartphone} transition={transition}><div className="relative h-[240px]">{deviceData.length ? <><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deviceData} dataKey="value" innerRadius={66} outerRadius={92} paddingAngle={4} stroke="none">{deviceData.map((item) => <Cell key={item.device} fill={devices[item.device]?.color || "#94a3b8"} />)}</Pie><Tooltip formatter={(value) => [`${value} lượt`, "Lượt xem"]} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-xs text-muted-foreground">Tổng lượt</p><p className="text-xl font-extrabold text-foreground">{compact.format(data.totalViews)}</p></div></div></> : <EmptyState />}</div><div className="space-y-2">{deviceData.map((item) => <div key={item.device} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs"><span className="font-bold text-foreground">{devices[item.device]?.icon} {item.name}</span><span className="text-muted-foreground">{item.count} · {Math.round(item.count / Math.max(data.totalViews, 1) * 100)}%</span></div>)}</div></Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Trang được quan tâm nhất" subtitle="Xếp hạng theo số lượt xem" icon={MousePointerClick} transition={transition}><div className="space-y-4">{data.topPages.map((page, index) => { const percent = Math.round(page.views / Math.max(data.topPages[0]?.views || 1, 1) * 100); return <motion.div key={page.path} initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .045 }}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate font-semibold text-foreground"><span className="mr-2 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>{page.path}</span><strong>{page.views}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: reduceMotion ? 0 : .7, delay: .2 + index * .05 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div></motion.div>})}{!data.topPages.length && <EmptyState />}</div></Panel>
        <Panel title="Nguồn truy cập" subtitle="Các kênh đưa người dùng đến website" icon={Link2} transition={transition}><div style={{ height: Math.max(280, data.topReferrers.length * 38) }}>{data.topReferrers.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.topReferrers} layout="vertical" margin={{ top: 8, right: 18, left: 10, bottom: 0 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="referrer" width={125} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value} lượt`, "Truy cập"]} contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#06b6d4" radius={[0, 8, 8, 0]} barSize={18} /></BarChart></ResponsiveContainer> : <EmptyState />}</div></Panel>
      </div>
    </motion.div>
  );
}

function formatDate(date: string) { const [, month, day] = date.split("-"); return `${day}/${month}`; }
function Panel({ title, subtitle, icon: Icon, transition, children }: { title: string; subtitle: string; icon: typeof Eye; transition: object; children: ReactNode }) { return <motion.section variants={sectionMotion} transition={transition} className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><Icon className="h-4 w-4" /></span></div>{children}</motion.section>; }
function EmptyState() { return <div className="grid h-full min-h-32 place-items-center text-sm text-muted-foreground">Chưa có dữ liệu để hiển thị.</div>; }
function AnalyticsSkeleton() { return <AdminPageLoading title="Đang tải dữ liệu truy cập" description="Đang phân tích lượt xem, thiết bị và nguồn truy cập website." />; }
