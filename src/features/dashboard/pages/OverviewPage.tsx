import { ArrowRight, BookOpenCheck, Clock3, Flame, Medal, Rocket, Sparkles, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import { DashboardCard, DashboardSkeleton, EmptyState, MetricCard, PageHeader } from "../components/DashboardPrimitives";
import { pageMotion } from "../components/dashboardMotion";

export function OverviewPage() {
  const { activeChild, dashboardData, isLoading, profiles } = useActiveChild();
  const { lang } = useLang();
  const navigate = useNavigate();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;

  if (isLoading) return <DashboardSkeleton />;
  if (!profiles.length) return <EmptyState icon={Rocket} title={text("Bắt đầu hành trình đầu tiên", "Start the first journey")} description={text("Tạo hồ sơ học sinh để theo dõi tiến độ và thành tích của bé.", "Create a student profile to track progress and achievements.")} action={<button onClick={() => navigate("/add-child")} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">{text("Thêm hồ sơ", "Add profile")}</button>} />;
  if (!activeChild || !dashboardData) return <DashboardSkeleton />;

  const stats = dashboardData.stats ?? { weeklyMinutes: 0, weeklyMinutesPctChange: 0, completedLessons: 0, completedLessonsLabel: "", bestSkill: "", overallScore: 0, streakDays: 0 };
  const { studyDays, activities } = dashboardData;
  const weeklyMinutes = stats.weeklyMinutes ?? 0;
  const weeklyChange = stats.weeklyMinutesPctChange ?? 0;
  const completedLessons = stats.completedLessons ?? 0;
  const overallScore = stats.overallScore ?? 0;
  const streakDays = stats.streakDays ?? 0;
  const chartData = studyDays.length ? studyDays.map((item) => ({ day: item.day, minutes: item.minutes ?? 0 })) : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => ({ day, minutes: 0 }));
  const completed = activities.filter((item) => item.status === "Hoàn thành").length;
  const goalItems = [
    { label: text("Hoàn thành 1 bài học", "Complete one lesson"), done: completed > 0 },
    { label: text("Học ít nhất 20 phút", "Study at least 20 minutes"), done: weeklyMinutes >= 20 },
    { label: text("Đạt điểm từ 80", "Score at least 80"), done: overallScore >= 80 },
  ];
  const goalsDone = goalItems.filter((item) => item.done).length;

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeader eyebrow={text("Không gian phụ huynh", "Parent space")} title={text(`Xin chào, ${activeChild.name} đang tiến bộ mỗi ngày`, `${activeChild.name} is making progress every day`)} description={text("Mọi chỉ số quan trọng được tóm tắt tại đây, rõ ràng và không cần tải lại khi chuyển tab.", "All important insights are summarized here and stay cached while you switch tabs.")} action={<button onClick={() => navigate("/student")} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"><Rocket className="h-4 w-4" />{text("Vào học ngay", "Start learning")}</button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <MetricCard icon={Clock3} label={text("Thời gian tuần này", "Study time this week")} value={`${weeklyMinutes} ${text("phút", "min")}`} note={`${weeklyChange >= 0 ? "+" : ""}${weeklyChange}%`} tone="blue" />
        <MetricCard icon={BookOpenCheck} label={text("Bài đã hoàn thành", "Lessons completed")} value={completedLessons} note={stats.completedLessonsLabel || text("Tuần này", "This week")} tone="emerald" delay={.04} />
        <MetricCard icon={Medal} label={text("Kỹ năng tốt nhất", "Best skill")} value={stats.bestSkill || text("Đang khám phá", "Exploring")} note={text("Nổi bật", "Highlight")} tone="violet" delay={.08} />
        <MetricCard icon={TrendingUp} label={text("Điểm tổng thể", "Overall score")} value={`${overallScore}/100`} note={text("Hiện tại", "Current")} tone="amber" delay={.12} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
        <DashboardCard>
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("Nhịp học trong tuần", "Weekly rhythm")}</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{text("Thời gian học mỗi ngày", "Daily study time")}</h2></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">{weeklyMinutes} {text("phút", "minutes")}</span></div>
          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="overviewMinutes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={.38} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={.02} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b82d" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }} dy={8} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip cursor={{ stroke: "#60a5fa", strokeDasharray: "4 4" }} contentStyle={{ borderRadius: 14, border: "1px solid #cbd5e1", boxShadow: "0 12px 30px -16px rgba(15,23,42,.35)", fontWeight: 700 }} formatter={(value) => [`${value ?? 0} ${text("phút", "min")}`, text("Thời gian học", "Study time")]} /><Area type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={3} fill="url(#overviewMinutes)" animationDuration={700} activeDot={{ r: 5, fill: "#2563eb", stroke: "white", strokeWidth: 3 }} /></AreaChart></ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard className="relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-orange-100/70 blur-2xl dark:bg-orange-500/10" />
          <div className="relative flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/12"><Target className="h-5 w-5" /></div><div className="grid h-14 w-14 place-items-center rounded-full border-[6px] border-blue-100 text-sm font-black text-blue-600 dark:border-blue-500/20 dark:text-blue-300">{goalsDone}/3</div></div>
          <h2 className="relative mt-5 text-lg font-black text-slate-900 dark:text-white">{text("Mục tiêu hôm nay", "Today's goals")}</h2>
          <div className="relative mt-4 space-y-3">{goalItems.map((goal) => <div key={goal.label} className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-bold ${goal.done ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400"}`}><span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${goal.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>{goal.done ? "✓" : ""}</span>{goal.label}</div>)}</div>
        </DashboardCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <DashboardCard>
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("Mới nhất", "Latest")}</p><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{text("Hoạt động gần đây", "Recent activity")}</h2></div><button onClick={() => navigate("/dashboard/history")} className="flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400">{text("Xem tất cả", "View all")}<ArrowRight className="h-4 w-4" /></button></div>
          <div className="mt-5 space-y-2">{activities.slice(0, 4).map((activity) => <div key={activity.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/70"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-500 shadow-sm dark:bg-slate-900"><BookOpenCheck className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-slate-800 dark:text-white">{activity.lesson}</span><span className="text-xs font-medium text-slate-400">{activity.datetime} · {activity.duration}</span></span><span className="text-xs font-black text-slate-600 dark:text-slate-300">{activity.score || "—"}</span></div>)}{activities.length === 0 && <p className="py-10 text-center text-sm font-medium text-slate-400">{text("Chưa có hoạt động học tập.", "No learning activity yet.")}</p>}</div>
        </DashboardCard>
        <DashboardCard className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white dark:border-indigo-500/30 dark:bg-none dark:bg-indigo-500/12">
          <Sparkles className="h-7 w-7 text-amber-300" /><h2 className="mt-6 text-2xl font-black">{streakDays} {text("ngày liên tiếp", "day streak")}</h2><p className="mt-2 text-sm font-medium leading-6 text-indigo-100 dark:text-slate-300">{text("Duy trì nhịp học đều đặn giúp bé ghi nhớ tốt hơn. Một bài ngắn hôm nay cũng tạo nên khác biệt.", "A consistent rhythm helps your child remember more. Even a short lesson today makes a difference.")}</p><button onClick={() => navigate("/student")} className="mt-7 flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-sm font-black backdrop-blur transition hover:bg-white/20">{text("Tiếp tục chuỗi học", "Continue the streak")}<Flame className="h-5 w-5 text-orange-300" /></button>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
