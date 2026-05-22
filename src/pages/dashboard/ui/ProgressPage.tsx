import { useEffect, useRef, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Award, Lock } from "lucide-react";
import { useActiveChild } from "@/shared/lib/activeChild";

/* ── scroll-reveal ─────────────────────────────────── */
function useReveal(threshold = 0.1) {
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function CustomLineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm">
        <p className="font-semibold text-gray-600">{label}</p>
        <p style={{ color: "var(--brand-primary)" }}>{payload[0].value} điểm</p>
      </div>
    );
  }
  return null;
}

/* ── Trend comparison cards ─────────────────────────── */
const COMPARISON_CARDS = [
  {
    label: "Tuần này",
    value: "91 điểm",
    sub: "Cao nhất mọi thời đại 🎉",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    label: "Tuần trước",
    value: "85 điểm",
    sub: "-6 điểm so với hiện tại",
    icon: TrendingDown,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    label: "Trung bình",
    value: "81.6 điểm",
    sub: "Trong 7 tuần gần nhất",
    icon: Minus,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
];

export function ProgressPage() {
  const { activeChild, dashboardData, isLoading } = useActiveChild();

  const scoreCard = useReveal();
  const trendCard = useReveal();
  const compCard = useReveal();
  const skillCard = useReveal();
  const areaCard = useReveal();

  if (isLoading || !activeChild || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải báo cáo tiến độ...
      </div>
    );
  }

  const plan = activeChild.plan;
  const isLocked = plan === "FREE";

  const skills = dashboardData.skills;
  const weeklyTrend = dashboardData.weeklyTrend;
  const stats = dashboardData.stats;

  const radialData = [
    {
      name: "Tổng thể",
      value: stats.overallScore,
      fill: "var(--brand-primary)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Tiến độ của {activeChild.name}
          {activeChild.plan !== "FREE" && (
            <span
              className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                activeChild.plan === "VIP"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {activeChild.plan}
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Cập nhật lần cuối: hôm nay
        </p>
      </div>
      {/* Top row: radial score + weekly trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall score */}
        <div
          ref={scoreCard.ref}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center ${scoreCard.visible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Điểm tổng thể
          </p>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={90 - 360 * (stats.overallScore / 100)}
                data={radialData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  background={{ fill: "#f3f4f6" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-800">
                {stats.overallScore}
              </span>
              <span className="text-xs text-gray-400 font-medium">/100</span>
            </div>
          </div>
          <span className="mt-3 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
            ↑ Tốt hơn tuần trước
          </span>
          <div className="mt-4 w-full grid grid-cols-2 gap-2 text-center">
            <div className="bg-blue-50 rounded-xl py-2">
              <p className="text-xs text-gray-400 font-medium">Bài đã làm</p>
              <p className="text-base font-extrabold text-blue-600">
                {stats.completedLessons}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl py-2">
              <p className="text-xs text-gray-400 font-medium">Chuỗi ngày</p>
              <p className="text-base font-extrabold text-orange-500">
                {stats.streakDays}🔥
              </p>
            </div>
          </div>
        </div>

        {/* Weekly trend line */}
        <div
          ref={trendCard.ref}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2 ${trendCard.visible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-sm font-bold text-gray-700 mb-4">
            Xu hướng điểm số (7 tuần gần nhất)
          </p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                domain={[60, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="diem"
                stroke="var(--brand-primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--brand-primary)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                isAnimationActive={trendCard.visible}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Comparison cards */}
      <div
        ref={compCard.ref}
        className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${compCard.visible ? "animate-fade-in-up" : "opacity-0"}`}
        style={{ animationDelay: "60ms" }}
      >
        {COMPARISON_CARDS.map(
          ({ label, value, sub, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl shadow-sm border ${border} p-5 flex items-center gap-4`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">{label}</p>
                <p className={`text-lg font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ),
        )}
      </div>
      {/* Skill breakdown */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
            <Lock size={32} className="text-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-700 mb-1">
              Phân tích AI bị khóa
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Nâng cấp PRO để xem phân tích kỹ năng chi tiết
            </p>
            <button className="px-5 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-bold rounded-xl hover:brightness-110 transition">
              Nâng cấp PRO cho {activeChild.name} (55k/tháng)
            </button>
          </div>
        )}
        <div
          className={isLocked ? "blur-sm pointer-events-none select-none" : ""}
        >
          <div
            ref={skillCard.ref}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${skillCard.visible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-gray-700">
                Phân tích kỹ năng
              </p>
              <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full font-semibold border border-yellow-100">
                <Award size={13} />
                Kỹ năng nổi bật: {stats.bestSkill}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {skills.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{s.label}</span>
                    <span className="font-bold text-gray-500">{s.pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.colorClass} transition-all duration-700`}
                      style={{
                        width: skillCard.visible ? `${s.pct}%` : "0%",
                        transitionDelay: "200ms",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>{" "}
        {/* close blur wrapper */}
      </div>{" "}
      {/* close relative wrapper */}
      {/* Area chart – study time over weeks */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
            <Lock size={32} className="text-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              Chỉ dành cho PRO / VIP
            </p>
          </div>
        )}
        <div
          className={isLocked ? "blur-sm pointer-events-none select-none" : ""}
        >
          <div
            ref={areaCard.ref}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${areaCard.visible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-700">
                Phân bổ thời gian học theo kỹ năng
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Số học
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                  Hình học
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart
                data={[
                  { week: "T1", soHoc: 30, hinhHoc: 20 },
                  { week: "T2", soHoc: 40, hinhHoc: 25 },
                  { week: "T3", soHoc: 28, hinhHoc: 32 },
                  { week: "T4", soHoc: 45, hinhHoc: 30 },
                  { week: "T5", soHoc: 38, hinhHoc: 42 },
                  { week: "T6", soHoc: 50, hinhHoc: 38 },
                  { week: "T7", soHoc: 42, hinhHoc: 48 },
                ]}
              >
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  unit=" ph"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{ fontWeight: "600", color: "#374151" }}
                />
                <Area
                  type="monotone"
                  dataKey="soHoc"
                  name="Số học"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gradBlue)"
                  isAnimationActive={areaCard.visible}
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey="hinhHoc"
                  name="Hình học"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#gradOrange)"
                  isAnimationActive={areaCard.visible}
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>{" "}
        {/* close blur wrapper */}
      </div>{" "}
      {/* close relative wrapper */}
      {/* Achievements row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { emoji: "🏆", label: "Top 10% học sinh", sub: "Tuần này" },
          {
            emoji: "🔥",
            label: `${stats.streakDays} ngày liên tiếp`,
            sub: "Kỷ lục cá nhân",
          },
          { emoji: "⭐", label: "Hoàn hảo 100/100", sub: "26/02/2026" },
          { emoji: "🎯", label: "Đạt mục tiêu tuần", sub: "3 tuần liên tiếp" },
        ].map(({ emoji, label, sub }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center gap-1.5"
          >
            <span className="text-2xl">{emoji}</span>
            <p className="text-xs font-bold text-gray-700 leading-tight">
              {label}
            </p>
            <p className="text-[11px] text-gray-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
