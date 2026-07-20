import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Crown,
  Eye,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { useAdminParentsQuery, useAdminStatsQuery } from "@/features/admin/api/adminQueries";
import { AdminPageLoading } from "@/features/admin/components/ui";

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function compactMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function AdminOverviewPage() {
  const reduceMotion = useReducedMotion();
  const { data: stats, isPending: statsPending } = useAdminStatsQuery();
  const { data: parents = [], isPending: parentsPending } = useAdminParentsQuery();
  const students = useMemo(() => parents.flatMap((parent) => parent.children), [parents]);

  const averageScore = useMemo(() => {
    if (!students.length) return 0;
    return Math.round(students.reduce((sum, student) => sum + (student.avgScore || 0), 0) / students.length);
  }, [students]);

  const plans = useMemo(() => {
    const total = students.length || 1;
    return ([
      { name: "FREE", count: students.filter((s) => s.plan === "FREE").length, color: "bg-slate-400", text: "text-slate-500", iconBg: "bg-slate-500/10 text-slate-500", icon: ShieldCheck },
      { name: "PRO", count: students.filter((s) => s.plan === "PRO").length, color: "bg-indigo-500", text: "text-indigo-500", iconBg: "bg-indigo-500/10 text-indigo-500", icon: Sparkles },
      { name: "VIP", count: students.filter((s) => s.plan === "VIP").length, color: "bg-amber-500", text: "text-amber-500", iconBg: "bg-amber-500/10 text-amber-500", icon: Crown },
    ] as const).map((plan) => ({ ...plan, percentage: Math.round((plan.count / total) * 100) }));
  }, [students]);

  if (statsPending || parentsPending || !stats) return <OverviewSkeleton />;

  const metrics = [
    { label: "Phụ huynh", value: stats.totalParents, note: "Tài khoản gia đình", icon: Users, iconClass: "bg-blue-500/10 text-blue-500", glow: "from-blue-500/20" },
    { label: "Học sinh", value: stats.totalStudents, note: "Hồ sơ đang quản lý", icon: GraduationCap, iconClass: "bg-violet-500/10 text-violet-500", glow: "from-violet-500/20" },
    ...plans.map((plan) => ({ label: `Gói ${plan.name}`, value: plan.count, note: `${plan.percentage}% tổng học sinh`, icon: plan.icon, iconClass: plan.iconBg, glow: plan.name === "PRO" ? "from-indigo-500/20" : plan.name === "VIP" ? "from-amber-500/20" : "from-slate-500/15" })),
    { label: "Doanh thu", value: compactMoney(stats.totalRevenue), note: "Doanh thu tích lũy", icon: WalletCards, iconClass: "bg-emerald-500/10 text-emerald-500", glow: "from-emerald-500/20" },
  ];

  const actions = [
    { title: "Hiệu suất học tập", description: "Điểm số, hoạt động và các học sinh cần chú ý.", to: "/admin/performance", icon: TrendingUp, color: "bg-indigo-500", tint: "bg-indigo-500/10 text-indigo-500" },
    { title: "Tài chính & Owner", description: "MRR, ARR, CAC, LTV và dòng tiền vận hành.", to: "/admin/finance", icon: BarChart3, color: "bg-emerald-500", tint: "bg-emerald-500/10 text-emerald-500" },
    { title: "Quản lý người dùng", description: "Tra cứu và quản lý cụm phụ huynh, học sinh.", to: "/admin/users", icon: Users, color: "bg-violet-500", tint: "bg-violet-500/10 text-violet-500" },
    { title: "Lượt truy cập", description: "Theo dõi nguồn, thiết bị và hành vi truy cập.", to: "/admin/analytics", icon: Eye, color: "bg-cyan-500", tint: "bg-cyan-500/10 text-cyan-500" },
  ];

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: reduceMotion ? 0 : 0.06 }} className="space-y-6 pb-8">
      <motion.section variants={cardMotion} transition={transition} className="relative isolate overflow-hidden rounded-[28px] border border-indigo-400/20 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-indigo-950/10 md:px-8 md:py-9">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,.38),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,.24),transparent_30%)]" />
        <motion.div aria-hidden className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], rotate: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur">
              <LayoutDashboard className="h-3.5 w-3.5" /> Trung tâm điều hành
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Mọi chỉ số quan trọng,<br className="hidden sm:block" /> trong một góc nhìn.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Theo dõi sức khỏe hệ thống, tăng trưởng người dùng và hiệu quả vận hành của ViOlympicKids.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <p className="text-xs font-medium text-slate-400">Tổng doanh thu</p>
              <p className="mt-1 text-xl font-bold">{VND.format(stats.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <p className="text-xs font-medium text-slate-400">Điểm trung bình</p>
              <p className="mt-1 text-xl font-bold">{averageScore}<span className="ml-1 text-sm font-medium text-slate-400">điểm</span></p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={cardMotion} transition={transition}>
        <div className="mb-3 flex items-end justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Tổng quan nhanh</p><h3 className="mt-1 text-xl font-bold text-foreground">Sức khỏe hệ thống</h3></div>
          <span className="hidden text-xs text-muted-foreground sm:block">Dữ liệu được cập nhật tự động</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-4">
          {metrics.map((metric, index) => (
            <motion.article key={metric.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay: index * 0.045 }} whileHover={reduceMotion ? undefined : { y: -4 }} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${metric.glow} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative flex items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{metric.label}</p><p className="mt-3 text-3xl font-extrabold tracking-tight">{metric.value}</p></div>
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${metric.iconClass}`}><metric.icon className="h-5 w-5" /></div>
              </div>
              <p className="relative mt-4 text-xs font-medium text-muted-foreground">{metric.note}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <motion.section variants={cardMotion} transition={transition} className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Điều hướng</p><h3 className="mt-1 text-xl font-bold text-card-foreground">Thao tác nhanh</h3></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <motion.div key={action.to} whileHover={reduceMotion ? undefined : { scale: 1.015 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
                <Link to={action.to} className="group flex min-h-32 items-start gap-4 rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:bg-accent/60">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${action.tint}`}><action.icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 font-bold text-foreground">{action.title}<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span><span className="mt-2 block text-xs leading-5 text-muted-foreground">{action.description}</span></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={cardMotion} transition={transition} className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Phân bổ</p><h3 className="mt-1 text-xl font-bold">Cơ cấu gói học sinh</h3></div><span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500">{students.length} hồ sơ</span></div>
          <div className="mt-7 space-y-6">
            {plans.map((plan, index) => (
              <div key={plan.name}>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-semibold"><plan.icon className={`h-4 w-4 ${plan.text}`} />{plan.name}</span><span className="font-bold">{plan.count}<span className="ml-1 font-medium text-muted-foreground">· {plan.percentage}%</span></span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${plan.percentage}%` }} transition={{ duration: reduceMotion ? 0 : 0.8, delay: 0.3 + index * 0.12, ease: "easeOut" }} className={`h-full rounded-full ${plan.color}`} /></div>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.06] p-4"><p className="text-xs font-semibold text-indigo-500">Tỷ lệ chuyển đổi trả phí</p><p className="mt-1 text-2xl font-extrabold">{students.length ? Math.round(((plans[1].count + plans[2].count) / students.length) * 100) : 0}%</p><p className="mt-1 text-xs text-muted-foreground">Học sinh đang sử dụng PRO hoặc VIP</p></div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function OverviewSkeleton() {
  return <AdminPageLoading title="Đang chuẩn bị bảng điều khiển" description="Đang tổng hợp người dùng, doanh thu và sức khỏe hệ thống." metricCount={6} />;
}
