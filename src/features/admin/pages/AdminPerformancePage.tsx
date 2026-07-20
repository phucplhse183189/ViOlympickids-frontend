import { useMemo } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AdminPageLoading } from "@/features/admin/components/ui";
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminParentsQuery } from "@/features/admin/api/adminQueries";

const sectionMotion = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const tooltipStyle = { borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)", boxShadow: "0 12px 30px rgb(0 0 0 / .12)" };

export function AdminPerformancePage() {
  const reduceMotion = useReducedMotion();
  const { data: parents = [], isPending } = useAdminParentsQuery();
  const transition = reduceMotion ? { duration: 0 } : { duration: .42, ease: [0.22, 1, 0.36, 1] as const };
  const students = useMemo(() => parents.flatMap((parent) => parent.children), [parents]);

  const averageScore = useMemo(() => students.length ? Math.round(students.reduce((sum, student) => sum + (student.avgScore || 0), 0) / students.length) : 0, [students]);
  const totalLessons = useMemo(() => students.reduce((sum, student) => sum + (student.totalLessons || 0), 0), [students]);
  const engagedStudents = useMemo(() => students.filter((student) => (student.totalLessons || 0) > 0).length, [students]);
  const engagementRate = students.length ? Math.round((engagedStudents / students.length) * 100) : 0;

  const statusData = useMemo(() => {
    const result = [
      { key: "active", name: "Hoạt động", parents: 0, students: 0 },
      { key: "inactive", name: "Không hoạt động", parents: 0, students: 0 },
      { key: "suspended", name: "Bị khóa", parents: 0, students: 0 },
    ];
    parents.forEach((parent) => {
      const parentStatus = ("status" in parent ? parent.status : "active") || "active";
      const parentBucket = result.find((item) => item.key === parentStatus);
      if (parentBucket) parentBucket.parents += 1;
      parent.children.forEach((student) => {
        const studentBucket = result.find((item) => item.key === student.status);
        if (studentBucket) studentBucket.students += 1;
      });
    });
    return result;
  }, [parents]);

  const familyData = useMemo(() => [...parents].sort((a, b) => b.children.length - a.children.length).slice(0, 7).map((parent) => ({ fullName: parent.name, name: parent.name.length > 16 ? `${parent.name.slice(0, 16)}…` : parent.name, students: parent.children.length })), [parents]);
  const learningData = useMemo(() => students.map((student, index) => ({ index: index + 1, name: student.name, score: student.avgScore || 0, lessons: student.totalLessons || 0 })), [students]);
  const attentionList = useMemo(() => [...students].sort((a, b) => {
    const aInactive = (a.totalLessons || 0) === 0 ? -1 : 0;
    const bInactive = (b.totalLessons || 0) === 0 ? -1 : 0;
    return aInactive - bInactive || (a.avgScore || 0) - (b.avgScore || 0);
  }).slice(0, 7), [students]);

  if (isPending) return <PerformanceSkeleton />;

  const kpis = [
    { label: "Điểm trung bình", value: `${averageScore}`, suffix: "/100", note: averageScore ? "Trung bình toàn hệ thống" : "Chưa phát sinh điểm số", icon: Award, style: "bg-indigo-500/10 text-indigo-500" },
    { label: "Học sinh", value: students.length, suffix: "hồ sơ", note: `${engagedStudents} đã bắt đầu học`, icon: GraduationCap, style: "bg-cyan-500/10 text-cyan-500" },
    { label: "Bài đã hoàn thành", value: totalLessons, suffix: "bài", note: "Tổng khối lượng học tập", icon: BookOpenCheck, style: "bg-emerald-500/10 text-emerald-500" },
    { label: "Tỷ lệ tham gia", value: `${engagementRate}%`, suffix: "", note: `${students.length - engagedStudents} học sinh chưa học`, icon: HeartPulse, style: "bg-rose-500/10 text-rose-500" },
  ];

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: reduceMotion ? 0 : .065 }} className="space-y-6 pb-8">
      <motion.section variants={sectionMotion} transition={transition} className="relative isolate overflow-hidden rounded-[28px] border border-cyan-400/20 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-cyan-950/10 md:px-8 md:py-9">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(6,182,212,.32),transparent_34%),radial-gradient(circle_at_88%_85%,rgba(139,92,246,.30),transparent_32%)]" />
        <motion.div aria-hidden className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" animate={reduceMotion ? undefined : { scale: [1, 1.09, 1], rotate: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity }} />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"><Activity className="h-3.5 w-3.5" /> Learning intelligence</div><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Nhìn thấy tiến bộ.<br className="hidden sm:block" /> Phát hiện sớm rủi ro.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Một góc nhìn thống nhất về mức độ tham gia, khối lượng học và sức khỏe học tập của toàn hệ thống.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[370px]"><HeroMetric label="Điểm trung bình" value={`${averageScore}/100`} icon={TrendingUp} /><HeroMetric label="Tỷ lệ tham gia" value={`${engagementRate}%`} icon={HeartPulse} /></div>
        </div>
      </motion.section>

      <motion.section variants={sectionMotion} transition={transition}>
        <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Tổng quan nhanh</p><h3 className="mt-1 text-xl font-bold text-foreground">Sức khỏe học tập</h3></div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-4">{kpis.map((item, index) => <motion.article key={item.label} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay: index * .05 }} whileHover={reduceMotion ? undefined : { y: -4 }} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{item.label}</p><p className="mt-3 text-3xl font-extrabold tracking-tight">{item.value}<span className="ml-1 text-xs font-semibold text-muted-foreground">{item.suffix}</span></p></div><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.style}`}><item.icon className="h-5 w-5" /></span></div><p className="mt-4 text-xs font-medium text-muted-foreground">{item.note}</p></motion.article>)}</div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Trạng thái tài khoản" subtitle="So sánh phụ huynh và học sinh" icon={ShieldAlert} transition={transition}>
          <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData} margin={{ top: 15, right: 6, left: -15, bottom: 0 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="parents" name="Phụ huynh" fill="#3b82f6" radius={[7, 7, 0, 0]} /><Bar dataKey="students" name="Học sinh" fill="#8b5cf6" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Gia đình nổi bật" subtitle="Số hồ sơ học sinh theo gia đình" icon={Users} transition={transition}>
          <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={familyData} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 0 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={105} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value} học sinh`, "Quy mô"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""} contentStyle={tooltipStyle} /><Bar dataKey="students" fill="#06b6d4" radius={[0, 8, 8, 0]} barSize={18} /></BarChart></ResponsiveContainer></div>
        </Panel>
      </div>

      <Panel title="Điểm số & khối lượng học" subtitle="Mỗi điểm dữ liệu đại diện cho một học sinh" icon={TrendingUp} transition={transition}>
        {learningData.length ? <div className="h-[340px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={learningData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={.25} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="index" tickFormatter={(value) => `HS ${value}`} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis yAxisId="score" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis yAxisId="lessons" orientation="right" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || "Học sinh"} contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 12 }} /><Area yAxisId="score" type="monotone" dataKey="score" name="Điểm trung bình" stroke="#f97316" strokeWidth={2.5} fill="url(#scoreArea)" /><Bar yAxisId="lessons" dataKey="lessons" name="Bài đã học" fill="#0ea5e9" opacity={.72} radius={[5, 5, 0, 0]} barSize={14} /><Line yAxisId="score" type="monotone" dataKey="score" name="" stroke="#f97316" strokeWidth={0} dot={{ fill: "#f97316", r: 3 }} legendType="none" /></ComposedChart></ResponsiveContainer></div> : <EmptyState />}
      </Panel>

      <motion.section variants={sectionMotion} transition={transition} className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Cần hành động</p><h3 className="mt-1 text-xl font-bold text-card-foreground">Học sinh cần chú ý</h3></div><span className="inline-flex w-fit items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Ưu tiên học sinh chưa phát sinh hoạt động</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="bg-muted/40 text-left text-[11px] font-bold uppercase tracking-[.1em] text-muted-foreground"><th className="px-6 py-3.5">Học sinh</th><th className="px-4 py-3.5">Điểm trung bình</th><th className="px-4 py-3.5">Bài đã học</th><th className="px-4 py-3.5">Tình trạng</th><th className="px-6 py-3.5 text-right">Mức ưu tiên</th></tr></thead><tbody>{attentionList.map((student, index) => { const noActivity = (student.totalLessons || 0) === 0; const lowScore = (student.avgScore || 0) < 50; return <motion.tr key={student.id || `${student.name}-${index}`} initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .04 }} className="border-t border-border transition-colors hover:bg-muted/40"><td className="px-6 py-4"><strong className="text-foreground">{student.name}</strong></td><td className="px-4 py-4"><span className={`font-bold ${lowScore ? "text-rose-500" : "text-foreground"}`}>{student.avgScore || 0}</span><span className="text-muted-foreground">/100</span></td><td className="px-4 py-4 text-foreground">{student.totalLessons || 0} bài</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${student.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>{student.status === "active" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}{student.status === "active" ? "Hoạt động" : student.status}</span></td><td className="px-6 py-4 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${noActivity ? "bg-rose-500/10 text-rose-500" : lowScore ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>{noActivity ? "Cao · Chưa học" : lowScore ? "Cao · Điểm thấp" : "Theo dõi"}</span></td></motion.tr>})}</tbody></table></div>
        {!attentionList.length && <EmptyState />}
      </motion.section>
    </motion.div>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof TrendingUp }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur"><div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-cyan-300" /></div><p className="mt-2 text-xl font-bold">{value}</p></div>; }
function Panel({ title, subtitle, icon: Icon, transition, children }: { title: string; subtitle: string; icon: typeof TrendingUp; transition: object; children: ReactNode }) { return <motion.section variants={sectionMotion} transition={transition} className="rounded-[24px] border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500"><Icon className="h-4 w-4" /></span></div>{children}</motion.section>; }
function EmptyState() { return <div className="grid min-h-40 place-items-center p-8 text-sm text-muted-foreground">Chưa có dữ liệu học tập để hiển thị.</div>; }
function PerformanceSkeleton() { return <AdminPageLoading title="Đang phân tích hiệu suất học tập" description="Đang tổng hợp tiến độ, điểm số và mức độ hoạt động của học sinh." />; }
