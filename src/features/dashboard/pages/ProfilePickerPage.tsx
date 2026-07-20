import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock3,
  Crown,
  Flame,
  LogOut,
  Plus,
  ShieldCheck,
  Star,
  Trophy,
  UserPlus,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";
import { childrenQueryKeys, useActiveChild } from "@/features/dashboard/context/activeChild";
import { ParentGate } from "@/shared/ui/ParentGate";
import { useLang } from "@/shared/lib/i18n";
import { AppHeader } from "@/shared/ui/AppHeader";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import * as childrenService from "@/features/dashboard/api/childrenService";
import type { ChildProfile, DashboardData } from "@/features/dashboard/api/childrenService";

function getGreeting(lang: "vi" | "en") {
  const hour = new Date().getHours();
  if (lang === "en") {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function ProfilePickerPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { lang, setLang } = useLang();
  const { user, setActiveRole, logout } = useAuth();
  const { profiles, isLoading, switchChild } = useActiveChild();
  const [showPinGate, setShowPinGate] = useState(false);
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  const greeting = useMemo(() => getGreeting(lang), [lang]);

  const dashboardQueries = useQueries({
    queries: profiles.map((profile) => ({
      queryKey: childrenQueryKeys.dashboard(profile.id),
      queryFn: () => childrenService.getDashboard(profile.id),
      staleTime: 2 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
    })),
  });
  const childStats = useMemo(
    () => Object.fromEntries(profiles.flatMap((profile, index) => dashboardQueries[index]?.data ? [[profile.id, dashboardQueries[index].data as DashboardData]] : [])),
    [profiles, dashboardQueries],
  );

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const totalAlerts = Object.values(childStats).reduce(
    (total, dashboard) => total + (dashboard.alerts?.length ?? 0),
    0,
  );

  function selectChild(profile: ChildProfile) {
    switchChild(profile.id);
    setActiveRole("child");
    navigate("/student");
  }

  function openParentDashboard() {
    setShowPinGate(false);
    setActiveRole("parent");
    navigate("/dashboard");
  }

  function signOut() {
    logout();
    navigate("/", { replace: true });
  }

  const enter = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="profile-picker-page relative min-h-screen overflow-hidden bg-[#f7f9ff] text-slate-800 dark:bg-[#081121] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/15 blur-3xl dark:bg-fuchsia-600/10" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-500/5" />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <AppHeader actions={<>
          <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="grid h-10 min-w-10 place-items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{lang === "vi" ? "EN" : "VI"}</button>
          <ThemeToggle />
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300">
            <LogOut size={17} />
            <span className="hidden sm:inline">{text("Đăng xuất", "Sign out")}</span>
          </button>
        </>} />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <motion.section {...enter} transition={{ duration: 0.4 }} className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <span>👋</span>
              {greeting}, {user.nickname}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {text("Hôm nay ai sẽ học?", "Who is learning today?")}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
              {text("Chọn một hồ sơ để tiếp tục hành trình chinh phục Toán học.", "Choose a profile to continue the Math learning journey.")}
            </p>
          </div>
          {profiles.length > 0 && (
            <button onClick={() => navigate("/add-child")} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400">
              <Plus size={18} /> {text("Thêm hồ sơ", "Add profile")}
            </button>
          )}
        </motion.section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
          <motion.section {...enter} transition={{ duration: 0.4, delay: 0.08 }} className="rounded-[2rem] border border-slate-200/80 bg-white/75 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/65 dark:shadow-black/10 sm:p-6">
            <div className="mb-5 flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300"><BookOpen size={20} /></span>
                <div>
                  <h2 className="font-black text-slate-800 dark:text-white">{text("Hồ sơ học tập", "Learning profiles")}</h2>
                  <p className="text-xs font-medium text-slate-400">{text(`${profiles.length} hồ sơ của gia đình`, `${profiles.length} family profiles`)}</p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />)}
              </div>
            ) : profiles.length === 0 ? (
              <EmptyProfiles onAdd={() => navigate("/add-child")} lang={lang} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile, index) => (
                  <ChildCard
                    key={profile.id}
                    profile={profile}
                    dashboard={childStats[profile.id]}
                    index={index}
                    lang={lang}
                    reduceMotion={!!reduceMotion}
                    onSelect={() => selectChild(profile)}
                  />
                ))}
              </div>
            )}
          </motion.section>

          <motion.aside {...enter} transition={{ duration: 0.4, delay: 0.16 }} className="lg:h-full">
            <button onClick={() => setShowPinGate(true)} className="group relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-left text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 lg:h-full">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-cyan-300/10" />
              <div className="relative">
                <div className="mb-8 flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"><BarChart3 size={24} /></span>
                  <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/10"><ShieldCheck size={18} />{totalAlerts > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black ring-2 ring-indigo-700">{totalAlerts}</span>}</span>
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-200">{text("Dành cho ba mẹ", "For parents")}</p>
                <h2 className="mt-1 text-2xl font-black">{text("Góc Phụ Huynh", "Parent Center")}</h2>
                <p className="mt-2 text-sm leading-6 text-blue-100">{text("Theo dõi tiến độ, xem báo cáo và quản lý gói học của con.", "Track progress, view reports and manage your child's plan.")}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">{text("Mở bảng điều khiển", "Open dashboard")} <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </button>

          </motion.aside>
        </div>
      </div>

      {showPinGate && <ParentGate onSuccess={openParentDashboard} onClose={() => setShowPinGate(false)} />}
    </main>
  );
}

function EmptyProfiles({ onAdd, lang }: { onAdd: () => void; lang: "vi" | "en" }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 px-6 py-12 text-center dark:border-blue-500/20 dark:from-blue-500/10 dark:to-violet-500/10 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-white shadow-xl shadow-blue-200/40 dark:bg-slate-800 dark:shadow-black/20">
        <img src="/robot-head.png" alt="" className="h-16 w-16 object-contain" />
        <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white ring-4 ring-blue-50 dark:ring-slate-900"><Plus size={19} strokeWidth={3} /></span>
      </div>
      <h3 className="mt-6 text-xl font-black text-slate-800 dark:text-white">{lang === "vi" ? "Tạo hồ sơ đầu tiên cho bé" : "Create your child's first profile"}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{lang === "vi" ? "Mỗi bé sẽ có lộ trình, thành tích và phần thưởng riêng trong suốt quá trình học." : "Each child gets their own learning path, achievements and rewards."}</p>
      <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"><UserPlus size={18} />{lang === "vi" ? "Thêm bé mới" : "Add a child"}<ArrowRight size={17} /></button>
    </div>
  );
}

function ChildCard({ profile, dashboard, index, lang, reduceMotion, onSelect }: { profile: ChildProfile; dashboard?: DashboardData; index: number; lang: "vi" | "en"; reduceMotion: boolean; onSelect: () => void }) {
  const stats = dashboard?.stats;
  const score = Math.round(stats?.overallScore ?? 0);
  const planStyle = profile.plan === "VIP" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : profile.plan === "PRO" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300";
  const scoreColor = score >= 80 ? "text-emerald-500 dark:text-emerald-300" : score >= 50 ? "text-amber-500 dark:text-amber-300" : "text-rose-500 dark:text-rose-300";

  return (
    <motion.button
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.24) }}
      onClick={onSelect}
      className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-[0_18px_40px_rgba(59,130,246,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-black/10 dark:hover:border-blue-500"
    >
      <div className="absolute inset-x-0 top-0 h-20 opacity-10 transition-opacity group-hover:opacity-15" style={{ background: `linear-gradient(135deg, ${profile.avatarBg || "#60a5fa"}, transparent)` }} />
      <div className="relative p-5">
        <div className="flex items-center gap-4">
          <div className="relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-[1.4rem] text-4xl shadow-md ring-4 ring-white transition duration-300 group-hover:scale-105 group-hover:-rotate-2 dark:ring-slate-700" style={{ backgroundColor: profile.avatarBg || "#dbeafe" }}>
            {profile.avatarEmoji || "🚀"}
            {profile.lastActive && <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-400 dark:border-slate-800" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">{profile.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{profile.grade || (lang === "vi" ? "Lớp 2" : "Grade 2")}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${planStyle}`}>
                {profile.plan === "VIP" ? <Crown size={10} /> : profile.plan === "PRO" ? <Zap size={10} /> : <Star size={10} />}
                {profile.plan === "FREE" ? (lang === "vi" ? "Miễn phí" : "Free") : profile.plan}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-3 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900/50">
          <Stat icon={<Trophy size={14} />} value={stats ? `${score}` : "—"} label={lang === "vi" ? "Điểm" : "Score"} tone={stats ? scoreColor : "text-slate-400"} />
          <Stat icon={<Flame size={14} />} value={`${stats?.streakDays ?? 0}`} label={lang === "vi" ? "Ngày" : "Days"} tone="text-orange-500 dark:text-orange-300" />
          <Stat icon={<Clock3 size={14} />} value={`${stats?.weeklyMinutes ?? 0}`} label={lang === "vi" ? "Phút" : "Mins"} tone="text-blue-500 dark:text-blue-300" />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-300 dark:group-hover:bg-blue-500 dark:group-hover:text-white"><span>{lang === "vi" ? "Vào học ngay" : "Start learning"}</span><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/70 transition-transform group-hover:translate-x-1 group-hover:bg-white/15"><ArrowRight size={16} /></span></div>
      </div>
    </motion.button>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: string }) {
  return <div className="flex flex-col items-center px-1"><span className={`flex items-center gap-1 text-sm font-black ${tone}`}>{icon}{value}</span><span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{label}</span></div>;
}
