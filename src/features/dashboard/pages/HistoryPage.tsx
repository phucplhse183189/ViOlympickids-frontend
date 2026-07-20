import { useDeferredValue, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Clock3, Download, History, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import { CustomSelect } from "@/shared/ui/CustomSelect";
import { DashboardCard, DashboardSkeleton, EmptyState, PageHeader } from "../components/DashboardPrimitives";
import { pageMotion } from "../components/dashboardMotion";

type StatusFilter = "all" | "done" | "progress";

export function HistoryPage() {
  const { activeChild, dashboardData, isLoading, profiles } = useActiveChild();
  const { lang } = useLang();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const activities = useMemo(() => dashboardData?.activities ?? [], [dashboardData?.activities]);
  const subjects = useMemo(() => Array.from(new Set(activities.map((item) => item.subject))).filter(Boolean), [activities]);

  const filtered = useMemo(() => activities.filter((item) => {
    const query = deferredSearch.trim().toLocaleLowerCase(lang === "vi" ? "vi" : "en");
    const normalizedStatus = item.status.toLocaleLowerCase("vi");
    const statusKey: Exclude<StatusFilter, "all"> | "other" = normalizedStatus.includes("hoàn") ? "done" : normalizedStatus.includes("dở") ? "progress" : "other";
    return (!query || `${item.lesson} ${item.subject}`.toLocaleLowerCase("vi").includes(query))
      && (subject === "all" || item.subject === subject)
      && (status === "all" || status === statusKey);
  }), [activities, deferredSearch, lang, status, subject]);

  const completed = activities.filter((item) => item.status.toLocaleLowerCase("vi").includes("hoàn")).length;
  const subjectOptions = [
    { value: "all", label: text("Tất cả môn", "All subjects") },
    ...subjects.map((item) => ({ value: item, label: item })),
  ];
  const statusOptions = [
    { value: "all" as const, label: text("Mọi trạng thái", "All statuses") },
    { value: "done" as const, label: text("Hoàn thành", "Completed") },
    { value: "progress" as const, label: text("Đang dở", "In progress") },
  ];

  const exportCsv = () => {
    const rows = [["Date", "Lesson", "Subject", "Duration", "Score", "Status"], ...filtered.map((item) => [item.datetime, item.lesson, item.subject, item.duration, item.score ?? "", item.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `learning-history-${activeChild?.name ?? "student"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <DashboardSkeleton />;
  if (!profiles.length) return <EmptyState icon={History} title={text("Chưa có lịch sử học tập", "No learning history yet")} description={text("Lịch sử sẽ xuất hiện sau khi bé bắt đầu học.", "History will appear after your child starts learning.")} />;
  if (!activeChild || !dashboardData) return <DashboardSkeleton />;

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeader title={text(`Lịch sử học tập của ${activeChild.name}`, `${activeChild.name}'s learning history`)} description={text("Tìm lại bài học, điểm số và thời lượng theo từng buổi học.", "Review lessons, scores and duration for every study session.")} action={<button onClick={exportCsv} disabled={!filtered.length} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="h-4 w-4" />{text("Xuất CSV", "Export CSV")}</button>} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpenCheck, label: text("Tổng hoạt động", "All activity"), value: activities.length, tone: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
          { icon: CheckCircle2, label: text("Hoàn thành", "Completed"), value: completed, tone: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
          { icon: Clock3, label: text("Đang dở", "In progress"), value: Math.max(0, activities.length - completed), tone: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
        ].map((item) => <DashboardCard key={item.label} className="p-3 sm:p-4"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${item.tone}`}><item.icon className="h-4 w-4" /></span><span><span className="block text-xl font-black text-slate-950 dark:text-white">{item.value}</span><span className="hidden text-xs font-bold text-slate-400 sm:block">{item.label}</span></span></div></DashboardCard>)}
      </div>

      <DashboardCard className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text("Tìm tên bài học hoặc môn học...", "Search lessons or subjects...")} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-4 w-4" /></button>}</label>
          <div className="grid grid-cols-2 gap-2 lg:flex">
            <div className="min-w-0 lg:w-48"><CustomSelect value={subject} onValueChange={setSubject} options={subjectOptions} ariaLabel={text("Lọc theo môn học", "Filter by subject")} className="h-12 rounded-2xl bg-white dark:bg-slate-800" /></div>
            <div className="min-w-0 lg:w-48"><CustomSelect value={status} onValueChange={setStatus} options={statusOptions} ariaLabel={text("Lọc theo trạng thái", "Filter by status")} className="h-12 rounded-2xl bg-white dark:bg-slate-800" /></div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0">
        {filtered.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((activity, index) => {
          const done = activity.status.toLocaleLowerCase("vi").includes("hoàn");
          return <motion.div key={activity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .025, .2) }} className="grid gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:grid-cols-[minmax(0,1fr)_130px_90px_110px] sm:items-center sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${done ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" : "bg-amber-50 text-amber-500 dark:bg-amber-500/10"}`}>{done ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}</span><span className="min-w-0"><span className="block truncate text-sm font-black text-slate-800 dark:text-white">{activity.lesson}</span><span className="text-xs font-semibold text-slate-400">{activity.subject} · {activity.datetime}</span></span></div><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{activity.duration}</span><span className="text-sm font-black text-slate-800 dark:text-white">{activity.score ?? "—"}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${done ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"}`}>{activity.status}</span></motion.div>;
        })}</div> : <div className="grid min-h-[320px] place-items-center px-5 text-center"><div><Search className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><h2 className="mt-4 text-lg font-black text-slate-800 dark:text-white">{text("Không tìm thấy kết quả", "No results found")}</h2><p className="mt-1 text-sm text-slate-400">{text("Thử thay đổi từ khóa hoặc bộ lọc.", "Try another keyword or filter.")}</p><button onClick={() => { setSearch(""); setSubject("all"); setStatus("all"); }} className="mt-4 text-sm font-black text-blue-600 dark:text-blue-400">{text("Xóa bộ lọc", "Clear filters")}</button></div></div>}
      </DashboardCard>
    </motion.div>
  );
}
