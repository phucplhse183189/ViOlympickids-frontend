import { Award, BarChart3, BookOpenCheck, Flame, Gauge, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import { DashboardCard, DashboardSkeleton, EmptyState, MetricCard, PageHeader } from "../components/DashboardPrimitives";
import { pageMotion } from "../components/dashboardMotion";

export function ProgressPage() {
  const { activeChild, dashboardData, isLoading, profiles } = useActiveChild();
  const { lang } = useLang();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  if (isLoading) return <DashboardSkeleton />;
  if (!profiles.length) return <EmptyState icon={BarChart3} title={text("Chưa có dữ liệu tiến độ", "No progress data yet")} description={text("Hãy thêm hồ sơ và hoàn thành bài học đầu tiên để xem phân tích.", "Add a profile and complete the first lesson to see insights.")} />;
  if (!activeChild || !dashboardData) return <DashboardSkeleton />;

  const stats = dashboardData.stats ?? { weeklyMinutes: 0, weeklyMinutesPctChange: 0, completedLessons: 0, completedLessonsLabel: "", bestSkill: "", overallScore: 0, streakDays: 0 };
  const overallScore = stats.overallScore ?? 0;
  const completedLessons = stats.completedLessons ?? 0;
  const streakDays = stats.streakDays ?? 0;
  const skills = dashboardData.skills;
  const trend = dashboardData.weeklyTrends.length ? dashboardData.weeklyTrends.map((item) => ({ week: item.week, diem: item.score ?? 0 })) : [{ week: text("Tuần này", "This week"), diem: overallScore }];
  const average = Math.round(trend.reduce((sum, item) => sum + item.diem, 0) / trend.length);
  const previous = trend.at(-2)?.diem ?? 0;
  const change = overallScore - previous;

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeader eyebrow={text("Báo cáo học tập", "Learning report")} title={text(`Tiến độ của ${activeChild.name}`, `${activeChild.name}'s progress`)} description={text("Theo dõi xu hướng điểm số, kỹ năng và nhịp học trong cùng một màn hình.", "Track score trends, skills and learning rhythm in one place.")} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <MetricCard icon={Gauge} label={text("Điểm tổng thể", "Overall score")} value={`${overallScore}/100`} note={change >= 0 ? `+${change}` : `${change}`} tone="blue" />
        <MetricCard icon={BookOpenCheck} label={text("Bài hoàn thành", "Completed lessons")} value={completedLessons} note={stats.completedLessonsLabel || text("Tuần này", "This week")} tone="emerald" delay={.04} />
        <MetricCard icon={Flame} label={text("Chuỗi ngày học", "Learning streak")} value={streakDays} note={text("ngày", "days")} tone="amber" delay={.08} />
        <MetricCard icon={Award} label={text("Điểm trung bình", "Average score")} value={`${average}/100`} note={text("7 tuần", "7 weeks")} tone="violet" delay={.12} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
        <DashboardCard>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("7 tuần gần nhất", "Last 7 weeks")}</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{text("Xu hướng điểm số", "Score trend")}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${change >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"}`}><TrendingUp className="mr-1 inline h-3.5 w-3.5" />{change >= 0 ? "+" : ""}{change} {text("điểm", "points")}</span></div>
          <div className="mt-6 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 10, right: 5, left: -24, bottom: 0 }}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={.35} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b833" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} dy={8} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #cbd5e1", fontWeight: 700 }} /><Area type="monotone" dataKey="diem" stroke="#3b82f6" strokeWidth={3} fill="url(#scoreFill)" activeDot={{ r: 6, fill: "#2563eb", stroke: "white", strokeWidth: 3 }} /></AreaChart></ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="grid h-full place-items-center py-5 text-center">
            <div><div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(#3b82f6 ${overallScore * 3.6}deg, rgba(148,163,184,.18) 0deg)` }}><div className="grid h-[132px] w-[132px] place-items-center rounded-full bg-white dark:bg-slate-900"><div><p className="text-4xl font-black text-slate-950 dark:text-white">{overallScore}</p><p className="text-xs font-bold text-slate-400">/100</p></div></div></div><div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Sparkles className="h-3.5 w-3.5" />{stats.bestSkill || text("Đang khám phá thế mạnh", "Discovering strengths")}</div><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">{text("Điểm tổng hợp được tính từ bài học, thời gian và mức độ ổn định.", "The overall score combines lessons, study time and consistency.")}</p></div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard>
        <div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("Phân tích kỹ năng", "Skill analysis")}</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{text("Năng lực theo chủ đề", "Topic proficiency")}</h2></div>
        <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">{skills.map((skill, index) => { const percentage = skill.percentage ?? 0; return <div key={`${skill.label}-${index}`}><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-sm font-extrabold text-slate-700 dark:text-slate-200">{skill.label}</span><span className="text-sm font-black text-blue-600 dark:text-blue-400">{percentage}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: .65, delay: index * .05 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" /></div></div>; })}{skills.length === 0 && <p className="col-span-full py-8 text-center text-sm font-medium text-slate-400">{text("Hoàn thành thêm bài học để mở khóa phân tích kỹ năng.", "Complete more lessons to unlock skill insights.")}</p>}</div>
      </DashboardCard>
    </motion.div>
  );
}
