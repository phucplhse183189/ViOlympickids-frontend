import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Crown,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminFinanceQuery } from "@/features/admin/api/adminQueries";
import type { FinanceStats } from "@/features/admin/api/adminService";
import { AdminFilterSelect, AdminPageLoading, AdminSearch } from "@/features/admin/components/ui";

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const DAY_MS = 24 * 60 * 60 * 1000;

const statusMeta: Record<string, { label: string; color: string; badge: string; icon: typeof CheckCircle2 }> = {
  PAID: { label: "Đã thanh toán", color: "#10b981", badge: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  PENDING: { label: "Đang chờ", color: "#f59e0b", badge: "bg-amber-500/10 text-amber-500", icon: Clock3 },
  CANCELLED: { label: "Đã hủy", color: "#f43f5e", badge: "bg-rose-500/10 text-rose-500", icon: XCircle },
};

const sectionMotion = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

export function AdminFinancePage() {
  const reduceMotion = useReducedMotion();
  const { data, isPending, isFetching, error, refetch } = useAdminFinanceQuery();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderPlan, setOrderPlan] = useState("all");
  const [orderCycle, setOrderCycle] = useState("all");

  const successRate = data?.totalTransactions ? Math.round((data.successTransactions / data.totalTransactions) * 100) : 0;
  const arr = (data?.mrr || 0) * 12;
  const averageOrder = data?.successTransactions ? Math.round(data.totalRevenue / data.successTransactions) : 0;
  const arpu = data?.activeSubscriptions ? Math.round(data.mrr / data.activeSubscriptions) : 0;
  const ltv = data?.activeSubscriptions ? Math.round(data.totalRevenue / data.activeSubscriptions) : 0;

  const planData = useMemo(() => (data?.planBreakdown || []).map((item) => ({ ...item, name: item.plan, value: item.revenue })), [data]);
  const orderStatusData = useMemo(() => (data?.paymentOrdersStats || []).map((item) => ({ ...item, name: statusMeta[item.status]?.label || item.status })), [data]);
  const filteredPaymentOrders = useMemo(() => {
    const query = orderSearch.trim().toLocaleLowerCase("vi");
    return (data?.recentPaymentOrders || []).filter((order) => {
      const matchesSearch = !query || [order.parentName, order.parentPhone, order.childName, order.orderCode]
        .some((value) => String(value || "").toLocaleLowerCase("vi").includes(query));
      return matchesSearch
        && (orderStatus === "all" || order.status === orderStatus)
        && (orderPlan === "all" || order.plan === orderPlan)
        && (orderCycle === "all" || order.cycle === orderCycle);
    });
  }, [data, orderCycle, orderPlan, orderSearch, orderStatus]);

  if (isPending) return <AdminPageLoading title="Đang chuẩn bị báo cáo tài chính" description="Đang tổng hợp doanh thu, thuê bao và giao dịch PayOS mới nhất." />;
  if (error || !data) return <div role="alert" className="mx-auto max-w-2xl rounded-[24px] border border-rose-500/20 bg-card p-8 text-center shadow-sm"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500"><XCircle className="h-5 w-5" /></span><h2 className="mt-4 text-lg font-extrabold text-foreground">Chưa thể tải báo cáo tài chính</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Kết nối tới máy chủ có thể đang gián đoạn. Dữ liệu của bạn không bị ảnh hưởng.</p><button onClick={() => void refetch()} disabled={isFetching} className="mx-auto mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{isFetching ? "Đang thử lại…" : "Thử tải lại"}</button></div>;

  const kpis = [
    { label: "Tổng doanh thu", value: VND.format(data.totalRevenue), note: `${data.successTransactions} giao dịch thành công`, icon: CircleDollarSign, style: "bg-emerald-500/10 text-emerald-500" },
    { label: "MRR", value: VND.format(data.mrr), note: `ARR dự phóng ${compact.format(arr)}`, icon: WalletCards, style: "bg-indigo-500/10 text-indigo-500" },
    { label: "Học sinh trả phí", value: data.activeSubscriptions, note: "PRO và VIP đang hoạt động", icon: Users, style: "bg-violet-500/10 text-violet-500" },
    { label: "Tỷ lệ thành công", value: `${successRate}%`, note: `${data.failedTransactions} thất bại / ${data.totalTransactions} tổng`, icon: CheckCircle2, style: "bg-cyan-500/10 text-cyan-500" },
  ];

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: reduceMotion ? 0 : 0.065 }} className="space-y-6 pb-8">
      <motion.section variants={sectionMotion} transition={transition} className="relative isolate overflow-hidden rounded-[28px] border border-emerald-400/20 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-emerald-950/10 md:px-8 md:py-9">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(16,185,129,.30),transparent_34%),radial-gradient(circle_at_88%_80%,rgba(99,102,241,.30),transparent_32%)]" />
        <motion.div aria-hidden className="absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"><Banknote className="h-3.5 w-3.5" /> Finance control center</div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Dòng tiền rõ ràng.<br className="hidden sm:block" /> Quyết định tự tin hơn.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Tổng hợp doanh thu, gói thuê bao và giao dịch PayOS trực tiếp từ dữ liệu vận hành.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[370px]">
            <HeroMetric label="Doanh thu tích lũy" value={VND.format(data.totalRevenue)} icon={ArrowUpRight} />
            <HeroMetric label="Doanh thu tháng" value={VND.format(data.mrr)} icon={data.mrr > 0 ? ArrowUpRight : ArrowDownRight} />
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionMotion} transition={transition}>
        <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Chỉ số chủ đạo</p><h3 className="mt-1 text-xl font-bold text-foreground">Sức khỏe doanh thu</h3></div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-4">
          {kpis.map((item, index) => (
            <motion.article key={item.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay: index * .05 }} whileHover={reduceMotion ? undefined : { y: -4 }} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{item.label}</p><p className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{item.value}</p></div><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.style}`}><item.icon className="h-5 w-5" /></span></div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">{item.note}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <AnimatedPanel title="Doanh thu theo tháng" subtitle="Xu hướng 12 tháng gần nhất" icon={ArrowUpRight} transition={transition}>
          <div className="h-[310px] w-full">
            {data.monthlyRevenue.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.monthlyRevenue} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="financeRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={.38} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(v) => compact.format(v)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={52} /><Tooltip formatter={(value) => [VND.format(Number(value || 0)), "Doanh thu"]} contentStyle={tooltipStyle} /><Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#financeRevenue)" activeDot={{ r: 6, strokeWidth: 3, stroke: "var(--card)" }} /></AreaChart></ResponsiveContainer> : <EmptyChart />}
          </div>
        </AnimatedPanel>

        <AnimatedPanel title="Doanh thu theo gói" subtitle="Tỷ trọng PRO và VIP" icon={Crown} transition={transition}>
          <div className="relative h-[230px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={planData} dataKey="value" innerRadius={66} outerRadius={92} paddingAngle={4} stroke="none">{planData.map((entry) => <Cell key={entry.plan} fill={entry.plan === "VIP" ? "#f59e0b" : "#6366f1"} />)}</Pie><Tooltip formatter={(value) => VND.format(Number(value || 0))} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-xs text-muted-foreground">Tổng cộng</p><p className="text-lg font-extrabold text-foreground">{compact.format(data.totalRevenue)}</p></div></div></div>
          <div className="space-y-2">{planData.map((plan) => <div key={plan.plan} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs"><span className="flex items-center gap-2 font-bold"><span className={`h-2.5 w-2.5 rounded-full ${plan.plan === "VIP" ? "bg-amber-500" : "bg-indigo-500"}`} />{plan.plan}</span><span className="text-muted-foreground">{plan.count} lượt · {VND.format(plan.revenue)}</span></div>)}</div>
        </AnimatedPanel>
      </div>

      {orderStatusData.length > 0 && <AnimatedPanel title="Trạng thái đơn PayOS" subtitle="Tổng quan hiệu quả xử lý thanh toán" icon={ReceiptText} transition={transition}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={orderStatusData}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Số đơn" radius={[8, 8, 0, 0]}>{orderStatusData.map((entry) => <Cell key={entry.status} fill={statusMeta[entry.status]?.color || "#94a3b8"} />)}</Bar></BarChart></ResponsiveContainer></div>
          <div className="flex flex-col justify-center gap-3">{orderStatusData.map((item) => { const meta = statusMeta[item.status] || statusMeta.PENDING; return <div key={item.status} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4"><span className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${meta.badge}`}><meta.icon className="h-4 w-4" /></span><span className="font-semibold text-foreground">{item.name}</span></span><span className="text-right"><strong className="block text-foreground">{item.count} đơn</strong><small className="text-muted-foreground">{VND.format(item.total)}</small></span></div>})}</div>
        </div>
      </AnimatedPanel>}

      <motion.section variants={sectionMotion} transition={transition} className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">PayOS ledger</p><h3 className="mt-1 text-xl font-bold text-card-foreground">Đơn hàng gần đây</h3></div><div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400"><CalendarClock className="h-4 w-4" /> Số ngày được tính riêng theo ngày thanh toán của từng đơn</div></div>
        <div className="border-b border-border bg-muted/20 p-4 sm:p-5">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_180px_150px_150px]">
            <AdminSearch value={orderSearch} onChange={setOrderSearch} placeholder="Khách hàng, SĐT, học sinh hoặc mã đơn…" />
            <AdminFilterSelect label="Trạng thái đơn" value={orderStatus} onChange={setOrderStatus} options={[{ value: "all", label: "Tất cả trạng thái" }, { value: "PAID", label: "Đã thanh toán" }, { value: "PENDING", label: "Đang chờ" }, { value: "CANCELLED", label: "Đã hủy" }]} />
            <AdminFilterSelect label="Gói học" value={orderPlan} onChange={setOrderPlan} options={[{ value: "all", label: "Tất cả gói" }, { value: "PRO", label: "PRO" }, { value: "VIP", label: "VIP" }]} />
            <AdminFilterSelect label="Chu kỳ" value={orderCycle} onChange={setOrderCycle} options={[{ value: "all", label: "Mọi chu kỳ" }, { value: "month", label: "Theo tháng" }, { value: "year", label: "Theo năm" }]} />
          </div>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Hiển thị {filteredPaymentOrders.length}/{data.recentPaymentOrders.length} đơn hàng</p>
        </div>
        {filteredPaymentOrders.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="bg-muted/40 text-left text-[11px] font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-6 py-3.5">Khách hàng</th><th className="px-4 py-3.5">Học sinh</th><th className="px-4 py-3.5">Gói</th><th className="px-4 py-3.5 text-right">Số tiền</th><th className="px-4 py-3.5 text-center">Trạng thái</th><th className="px-6 py-3.5">Thời gian</th></tr></thead><tbody>{filteredPaymentOrders.map((order, index) => <OrderRow key={order.id} order={order} index={index} reduceMotion={!!reduceMotion} />)}</tbody></table></div>}
        {!filteredPaymentOrders.length && <div className="p-12 text-center text-sm text-muted-foreground">{data.recentPaymentOrders.length ? "Không tìm thấy đơn hàng phù hợp với bộ lọc." : "Chưa có đơn hàng PayOS."}</div>}
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <AnimatedPanel title="Giao dịch gần đây" subtitle="Các khoản thu đã ghi nhận" icon={Clock3} transition={transition}>
          <div className="space-y-2">{data.recentTransactions.slice(0, 6).map((tx) => <div key={tx.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/40 p-3.5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><Banknote className="h-4 w-4" /></span><span className="min-w-0"><strong className="block truncate text-sm text-foreground">{tx.method}</strong><small className="text-muted-foreground">{tx.date}</small></span></div><div className="text-right"><strong className="block text-sm text-foreground">+{VND.format(tx.amount)}</strong><small className={tx.status === "Thành công" ? "text-emerald-500" : "text-rose-500"}>{tx.status}</small></div></div>)}</div>
        </AnimatedPanel>
        <motion.section variants={sectionMotion} transition={transition} className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">{[
          ["Giá trị đơn TB", averageOrder, "Trên giao dịch thành công"],
          ["LTV ước tính", ltv, "Doanh thu / học sinh trả phí"],
          ["ARPU", arpu, "MRR / học sinh trả phí"],
        ].map(([label, value, note]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-extrabold text-card-foreground">{Number(value) ? VND.format(Number(value)) : "—"}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>)}</motion.section>
      </div>
    </motion.div>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ArrowUpRight }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur"><div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-emerald-300" /></div><p className="mt-2 text-lg font-bold">{value}</p></div>; }

function AnimatedPanel({ title, subtitle, icon: Icon, transition, children }: { title: string; subtitle: string; icon: typeof ArrowUpRight; transition: object; children: ReactNode }) { return <motion.section variants={sectionMotion} transition={transition} className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span></div>{children}</motion.section>; }

function OrderRow({ order, index, reduceMotion }: { order: FinanceStats["recentPaymentOrders"][number]; index: number; reduceMotion: boolean }) {
  const meta = statusMeta[order.status] || statusMeta.PENDING;
  const eventDate = new Date(order.status === "PAID" && order.paidAt ? order.paidAt : order.createdAt);
  const packageDays = order.cycle === "year" ? 365 : 30;
  const elapsedDays = order.paidAt ? Math.max(0, Math.floor((Date.now() - new Date(order.paidAt).getTime()) / DAY_MS)) : 0;
  return <motion.tr initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .035 }} className="border-t border-border transition-colors hover:bg-muted/40"><td className="px-6 py-4"><strong className="block text-foreground">{order.parentName}</strong><small className="text-muted-foreground">{order.parentPhone || "Chưa có SĐT"}</small></td><td className="px-4 py-4"><span className="mr-2">{order.childEmoji}</span><span className="font-medium text-foreground">{order.childName}</span></td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${order.plan === "VIP" ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"}`}>{order.plan === "VIP" ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}{order.plan} · {order.cycle === "year" ? "Năm" : "Tháng"}</span>{order.status === "PAID" && order.planDaysLeft != null && <small className="mt-1.5 block text-muted-foreground">Còn {order.planDaysLeft}/{packageDays} ngày · đã qua {elapsedDays} ngày</small>}</td><td className="px-4 py-4 text-right font-bold text-foreground">{VND.format(order.amount)}</td><td className="px-4 py-4 text-center"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.badge}`}><meta.icon className="h-3.5 w-3.5" />{meta.label}</span></td><td className="px-6 py-4"><span className="block text-foreground">{eventDate.toLocaleDateString("vi-VN")}</span><small className="text-muted-foreground">{eventDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</small></td></motion.tr>;
}

const tooltipStyle = { borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)", boxShadow: "0 12px 30px rgb(0 0 0 / .12)" };
function EmptyChart() { return <div className="grid h-full place-items-center text-sm text-muted-foreground">Chưa có dữ liệu doanh thu.</div>; }
