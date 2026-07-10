import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  BookOpen,
  Star,
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { StudyProgressChart } from "@/features/dashboard/components/StudyProgressChart";
import { RecentActivityTable } from "@/features/dashboard/components/RecentActivityTable";
import { useActiveChild } from "@/features/dashboard/context/activeChild";

/* ── tiny count-up hook ── */
function useCountUp(target: number, duration = 1000, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      setCount(Math.min(Math.round((frame / totalFrames) * target), target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

/* ── scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  countTarget?: number;
  countSuffix?: string;
  badge?: string;
  badgeColor?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function StatCard({
  icon,
  iconBg,
  title,
  value,
  countTarget,
  countSuffix = "",
  badge,
  badgeColor,
  delay = 0,
}: StatCardProps) {
  const { ref, visible } = useReveal();
  const count = useCountUp(
    countTarget ?? 0,
    1000,
    visible && countTarget !== undefined,
  );
  const displayValue =
    countTarget !== undefined && visible ? `${count}${countSuffix}` : value;

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${visible ? "animate-icon-bounce-in" : ""}`}
        style={{ animationDelay: `${delay + 150}ms` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
          {title}
        </p>
        <p
          className={`text-2xl font-extrabold text-gray-800 leading-tight ${visible ? "animate-count-pop" : "opacity-0"}`}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          {displayValue}
        </p>
        {badge && (
          <span
            className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeColor} ${visible ? "animate-badge-pop" : "opacity-0"}`}
            style={{ animationDelay: `${delay + 320}ms` }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Daily goal progress (tính từ dữ liệu thật) ──── */
function computeDailyGoals(dashboardData: any) {
  const today = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const activities = dashboardData?.activities || [];
  const studyDays = dashboardData?.studyDays || [];

  // 1) Hoàn thành 1 bài hoc hôm nay
  const completedToday = activities.some(
    (a: any) => a.status === "Hoàn thành" && a.datetime?.includes(today),
  );

  // 2) Học ít nhất 20 phút hôm nay
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const todayDay = dayNames[new Date().getDay()];
  const todayStudy = studyDays.find((d: any) => d.day === todayDay);
  const studiedEnough = (todayStudy?.minutes || 0) >= 20;

  // 3) Đạt điểm ≥ 80 hôm nay
  const highScoreToday = activities.some(
    (a: any) =>
      a.datetime?.includes(today) &&
      a.score &&
      parseInt(a.score) >= 80,
  );

  return [
    { label: "Hoàn thành 1 bài học", done: completedToday },
    { label: "Học ít nhất 20 phút", done: studiedEnough },
    { label: "Đạt điểm ≥ 80", done: highScoreToday },
  ];
}

function DailyGoalCard({ dashboardData }: { dashboardData: any }) {
  const { ref, visible } = useReveal();
  const goals = computeDailyGoals(dashboardData);
  const completed = goals.filter((g) => g.done).length;
  const pct = Math.round((completed / goals.length) * 100);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Mục tiêu hôm nay
          </p>
          <p className="text-lg font-extrabold text-gray-800 mt-0.5">
            {completed}/{goals.length} hoàn thành
          </p>
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="6"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke={pct === 100 ? "#22c55e" : "var(--brand-primary)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-gray-700">
            {pct}%
          </span>
        </div>
      </div>
      <ul className="space-y-2.5">
        {goals.map((g) => (
          <li key={g.label} className="flex items-center gap-2.5">
            {g.done ? (
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            ) : (
              <Circle size={16} className="text-gray-300 shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${g.done ? "text-gray-500 line-through" : "text-gray-700"}`}
            >
              {g.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Quick actions ──────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    label: "Xem bài học hôm nay",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    href: "/student",
  },
  {
    label: "Kiểm tra tiến độ",
    icon: TrendingUp,
    color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    href: "/dashboard/progress",
  },
  {
    label: "Xem thành tích",
    icon: Star,
    color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100",
    href: "/dashboard/history",
  },
];

function QuickActionsCard() {
  const { ref, visible } = useReveal();
  const navigate = useNavigate();
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: "380ms" }}
    >
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-4">
        Thao tác nhanh
      </p>
      <div className="space-y-2.5">
        {QUICK_ACTIONS.map(({ label, icon: Icon, color, href }) => (
          <button
            key={label}
            onClick={() => navigate(href)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${color}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon size={16} className="shrink-0" />
              {label}
            </div>
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────── */
export function OverviewPage() {
  const navigate = useNavigate();
  const { activeChild, dashboardData, isLoading, profiles } = useActiveChild();
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableVisible, setTableVisible] = useState(false);

  useEffect(() => {
    const observe = (el: HTMLElement | null, cb: () => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            cb();
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      return () => obs.disconnect();
    };
    observe(headingRef.current, () => setHeadingVisible(true));
    observe(chartRef.current, () => setChartVisible(true));
    observe(tableRef.current, () => setTableVisible(true));
  }, [activeChild, dashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  if (!isLoading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center space-y-5">
          <div className="text-6xl">📚</div>
          <h3 className="text-xl font-bold text-gray-800">Chưa có hồ sơ học sinh</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Hãy thêm hồ sơ cho bé để bắt đầu theo dõi tiến độ học tập
          </p>
          <button
            onClick={() => navigate("/add-child")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-xl hover:brightness-110 transition shadow-sm"
          >
            <Plus size={18} />
            Thêm bé ngay
          </button>
        </div>
      </div>
    );
  }

  if (!activeChild || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    weeklyMinutes: 0,
    weeklyMinutesPctChange: 0,
    completedLessons: 0,
    completedLessonsLabel: "",
    bestSkill: "Chưa có",
    overallScore: 0,
    streakDays: 0,
  };
  const plan = activeChild.plan;
  const isLocked = plan === "FREE";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        ref={headingRef}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${headingVisible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Xin chào,{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {activeChild.name}
            </span>{" "}
            đang học tốt! 🎉
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Cập nhật lần cuối:{" "}
            {activeChild.lastActive
              ? new Date(activeChild.lastActive).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Chưa có dữ liệu"}
          </p>
        </div>
        {/* Streak badge */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 self-start sm:self-auto">
          <Flame size={18} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-600">
            {(stats?.streakDays || 0)} ngày liên tiếp
          </span>
          <span className="text-xs text-orange-400">🔥</span>
        </div>
      </div>

      {/* Plan status banner */}
      {plan === "FREE" && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">
            🔒
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">
              {activeChild.name} đang dùng gói{" "}
              <span className="text-gray-500">Miễn phí</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Nâng cấp để xem biểu đồ chi tiết và phân tích AI lỗi sai
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/payment?plan=PRO")}
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-bold rounded-xl hover:brightness-110 transition shadow-sm whitespace-nowrap"
          >
            Nâng cấp PRO (55k/tháng)
          </button>
        </div>
      )}
      {plan === "VIP" && activeChild.planDaysLeft != null && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">
              Tài khoản VIP — {activeChild.name}
            </p>
            <p className="text-xs text-gray-500">
              Còn {activeChild.planDaysLeft} ngày
            </p>
          </div>
          {activeChild.planDaysLeft <= 30 && (
            <button
              onClick={() => navigate("/dashboard/payment?plan=VIP")}
              className="shrink-0 px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl hover:bg-yellow-600 transition"
            >
              Gia hạn VIP
            </button>
          )}
        </div>
      )}
      {plan === "PRO" &&
        activeChild.planDaysLeft != null &&
        activeChild.planDaysLeft <= 7 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-700">
                Gói PRO sắp hết hạn — Còn {activeChild.planDaysLeft} ngày
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/payment?plan=PRO")}
              className="shrink-0 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition"
            >
              Gia hạn ngay
            </button>
          </div>
        )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock size={22} className="text-blue-500" />}
          iconBg="bg-blue-50"
          title="Thời gian học tuần này"
          value={`${stats.weeklyMinutes} phút`}
          countTarget={stats.weeklyMinutes || 0}
          countSuffix=" phút"
          badge={`↑ +${stats.weeklyMinutesPctChange}% tuần trước`}
          badgeColor="bg-green-100 text-green-700"
          delay={0}
        />
        <StatCard
          icon={<Trophy size={22} className="text-yellow-500" />}
          iconBg="bg-yellow-50"
          title="Bài hoàn thành tuần này"
          value={`${stats.completedLessons} bài`}
          countTarget={stats.completedLessons || 0}
          countSuffix=" bài"
          badge={stats.completedLessonsLabel || ""}
          badgeColor="bg-yellow-100 text-yellow-700"
          delay={80}
        />
        <StatCard
          icon={<Target size={22} className="text-purple-500" />}
          iconBg="bg-purple-50"
          title="Kỹ năng tốt nhất"
          value={stats.bestSkill || ""}
          badge="⭐ Điểm mạnh nổi bật"
          badgeColor="bg-purple-100 text-purple-700"
          delay={160}
        />
        <StatCard
          icon={<TrendingUp size={22} className="text-green-500" />}
          iconBg="bg-green-50"
          title="Điểm tổng thể"
          value={`${stats.overallScore}/100`}
          countTarget={stats.overallScore || 0}
          countSuffix="/100"
          badge="↑ Tốt hơn tuần trước"
          badgeColor="bg-green-100 text-green-700"
          delay={240}
        />
      </div>

      {/* Daily goal + Quick actions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyGoalCard dashboardData={dashboardData} />
        <QuickActionsCard />
      </div>

      {/* Progress chart */}
      <div
        ref={chartRef}
        className={`relative ${chartVisible ? "animate-fade-in-up" : "opacity-0"}`}
        style={{ animationDelay: "80ms" }}
      >
        {isLocked && (
          <LockedOverlay
            childName={activeChild.name}
            title="Tính năng PRO"
            onUpgrade={() => navigate("/dashboard/payment?plan=PRO")}
          />
        )}
        <div
          className={isLocked ? "blur-sm pointer-events-none select-none" : ""}
        >
          <StudyProgressChart />
        </div>
      </div>

      {/* Activity table */}
      <div
        ref={tableRef}
        className={`relative ${tableVisible ? "animate-fade-in-up" : "opacity-0"}`}
        style={{ animationDelay: "120ms" }}
      >
        {isLocked && (
          <LockedOverlay
            childName={activeChild.name}
            title="Tính năng VIP"
            onUpgrade={() => navigate("/dashboard/payment?plan=PRO")}
          />
        )}
        <div
          className={isLocked ? "blur-sm pointer-events-none select-none" : ""}
        >
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}

/** Overlay for locked (FREE plan) sections */
function LockedOverlay({
  childName,
  title,
  onUpgrade,
}: {
  childName: string;
  title: string;
  onUpgrade: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
      <div className="text-4xl mb-3">🔒</div>
      <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-3 text-center max-w-xs">
        Nâng cấp gói PRO cho {childName} để xem phân tích chi tiết
      </p>
      <button
        onClick={onUpgrade}
        className="px-5 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-bold rounded-xl hover:brightness-110 transition shadow-sm"
      >
        Nâng cấp VIP (89k/tháng)
      </button>
    </div>
  );
}
