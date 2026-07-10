import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ShieldCheck,
  LogOut,
  Zap,
  Crown,
  Flame,
  Clock,
  BarChart3,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";
import { ParentGate } from "@/shared/ui/ParentGate";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import * as childrenService from "@/features/dashboard/api/childrenService";
import type { DashboardData, ChildProfile } from "@/features/dashboard/api/childrenService";

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}


function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "linear-gradient(135deg, #22c55e, #4ade80)";
  if (score >= 50) return "linear-gradient(135deg, #f59e0b, #fbbf24)";
  return "linear-gradient(135deg, #ef4444, #f87171)";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Xuất sắc";
  if (score >= 80) return "Giỏi";
  if (score >= 65) return "Khá";
  if (score >= 50) return "Trung bình";
  return "Cần cố gắng";
}

export function ProfilePickerPage() {
  const navigate = useNavigate();
  const { user, setActiveRole, logout } = useAuth();
  const { profiles, isLoading, switchChild, refreshProfiles } = useActiveChild();
  const [showPinGate, setShowPinGate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [childStats, setChildStats] = useState<Record<string, DashboardData>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const greeting = useMemo(() => getTimeGreeting(), []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch quick stats for each child
  useEffect(() => {
    async function fetchAllDashboards() {
      if (!profiles || profiles.length === 0) return;
      const statsMap: Record<string, DashboardData> = {};
      await Promise.all(
        profiles.map(async (p) => {
          try {
            const dash = await childrenService.getDashboard(p.id);
            statsMap[p.id] = dash;
          } catch (e) {
            console.error(e);
          }
        })
      );
      setChildStats(statsMap);
    }
    fetchAllDashboards();
  }, [profiles]);

  // Refresh profiles on focus (after returning from /add-child)
  useEffect(() => {
    const onFocus = () => refreshProfiles();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshProfiles]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  function selectChild(profile: ChildProfile) {
    switchChild(profile.id);
    setActiveRole("child");
    navigate("/student");
  }

  function handleParentUnlocked() {
    setShowPinGate(false);
    setActiveRole("parent");
    navigate("/dashboard");
  }

  if (!user) return null;

  const totalAlerts = Object.values(childStats).reduce((s, c) => s + (c.alerts?.length || 0), 0);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ── Animated gradient background ── */}
      <div
        className="absolute inset-0 animate-gradient-x"
        style={{
          background:
            "linear-gradient(135deg, #ede9fe 0%, #dbeafe 20%, #d1fae5 40%, #fef9c3 60%, #fce7f3 80%, #e0e7ff 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* ── Decorative floating orbs ── */}
      <div className="absolute top-[8%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-violet-300/20 to-blue-300/20 animate-float-slow blur-xl" />
      <div
        className="absolute top-[15%] right-[8%] w-24 h-24 rounded-full bg-gradient-to-br from-pink-300/20 to-rose-300/20 animate-float-slow blur-xl"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-[20%] left-[10%] w-20 h-20 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-300/20 animate-float-slow blur-xl"
        style={{ animationDelay: "0.8s" }}
      />
      <div
        className="absolute bottom-[15%] right-[6%] w-28 h-28 rounded-full bg-gradient-to-br from-emerald-300/15 to-teal-300/15 animate-float-slow blur-xl"
        style={{ animationDelay: "2.2s" }}
      />
      {/* Spinning rings */}
      <div className="absolute -top-28 -left-28 w-72 h-72 border border-dashed border-violet-200/15 rounded-full animate-spin-slow" />
      <div
        className="absolute -bottom-24 -right-24 w-56 h-56 border border-dashed border-rose-200/15 rounded-full animate-spin-slow"
        style={{ animationDirection: "reverse" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-10">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg shadow-blue-500/10 flex items-center justify-center border border-white/80">
            <img
              src="/robot-head.png"
              alt="ViOlympicKids"
              className="w-9 h-9 object-contain"
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-blue-500">ViOlympic</span>
            <span style={{ color: "var(--brand-primary)" }}>Kids</span>
          </span>
        </div>

        {/* Greeting + Title */}
        <div
          className="text-center mb-10 transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(15px)",
            transitionDelay: "150ms",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white/80 mb-4">
            <span className="text-sm">👋</span>
            <span className="text-sm text-gray-500">
              {greeting},{" "}
              <span className="font-bold text-gray-700">{user.nickname}</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
            Ai sẽ học hôm nay?
          </h1>
          <p className="text-gray-400 text-[13px]">
            Chọn hồ sơ để bắt đầu khám phá thế giới Toán học
          </p>
        </div>

        {/* ── Child profile cards ── */}
        <div className="flex flex-wrap gap-5 justify-center max-w-5xl mb-10">
          {isLoading ? (
            <div className="flex items-center gap-3 text-gray-400 py-12">
              <span className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Đang tải hồ sơ...</span>
            </div>
          ) : profiles.map((profile, i) => {
            const dash = childStats[profile.id];
            const stats = dash?.stats;
            const score = stats?.overallScore ?? 0;
            const isHovered = hoveredCard === profile.id;
            const hasStats = !!stats;

            return (
              <button
                key={profile.id}
                onClick={() => selectChild(profile)}
                onMouseEnter={() => setHoveredCard(profile.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group flex flex-col items-center gap-0 bg-white/90 backdrop-blur-sm rounded-[1.8rem] shadow-lg border-2 border-white/80 hover:border-orange-300 hover:shadow-2xl hover:-translate-y-3 active:translate-y-0 active:shadow-lg transition-all duration-300 w-56 cursor-pointer overflow-hidden"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted
                    ? "translateY(0) scale(1)"
                    : "translateY(30px) scale(0.9)",
                  transition: `opacity 500ms ease-out ${300 + i * 120}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + i * 120}ms, border-color 200ms, box-shadow 200ms`,
                }}
              >
                {/* Top colored accent bar */}
                <div
                  className="w-full h-1.5 transition-all duration-300"
                  style={{
                    background: isHovered
                      ? "linear-gradient(90deg, #f97316, #fb923c)"
                      : `linear-gradient(90deg, ${profile.avatarBg || "#e5e7eb"}, ${profile.avatarBg || "#e5e7eb"}88)`,
                  }}
                />

                <div className="flex flex-col items-center gap-3 p-5 pb-4 w-full">
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-[1.2rem] opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-xl scale-125"
                      style={{ backgroundColor: profile.avatarBg || "#f3f4f6" }}
                    />
                    <div
                      className="relative rounded-[1.2rem] flex items-center justify-center text-5xl shadow-md group-hover:scale-110 group-hover:rotate-3 group-active:scale-95 transition-all duration-300 border-3 border-white/60"
                      style={{
                        backgroundColor: profile.avatarBg || "#f3f4f6",
                        width: "5.5rem",
                        height: "5.5rem",
                      }}
                    >
                      {profile.avatarEmoji}
                    </div>
                    {/* Online-style indicator */}
                    {profile.lastActive && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm flex items-center justify-center">
                        <Star size={10} className="text-white" fill="white" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="text-center space-y-1.5">
                    <p className="font-extrabold text-gray-800 text-[15px] group-hover:text-orange-600 transition-colors leading-tight">
                      {profile.name}
                    </p>
                    <div className="flex items-center gap-1.5 justify-center flex-wrap">
                      {profile.plan === "VIP" && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-2.5 py-0.5 rounded-full shadow-sm shadow-amber-200">
                          <Crown size={10} /> VIP
                        </span>
                      )}
                      {profile.plan === "PRO" && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm shadow-blue-200">
                          <Zap size={10} /> Pro
                        </span>
                      )}
                      {profile.plan === "FREE" && (
                        <span className="inline-block text-[10px] font-bold bg-gray-100 text-gray-400 px-2.5 py-0.5 rounded-full">
                          Miễn phí
                        </span>
                      )}
                    </div>
                    {profile.plan !== "FREE" && profile.planDaysLeft != null && (
                      <p className="text-[10px] text-gray-300 font-medium">
                        Còn {profile.planDaysLeft} ngày
                      </p>
                    )}
                  </div>

                  {/* Quick stats */}
                  {hasStats ? (
                    <div className="w-full space-y-2.5 pt-2.5 mt-0.5 border-t border-gray-100/80">
                      {/* Score circle + bar */}
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{ background: getScoreGradient(score) }}
                        >
                          <span className="text-[13px] font-black text-white leading-none">
                            {score}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-gray-500">
                              {getScoreLabel(score)}
                            </span>
                            <TrendingUp
                              size={11}
                              style={{ color: getScoreColor(score) }}
                            />
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${Math.min(100, score)}%`,
                                background: getScoreGradient(score),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Streak + Time */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className="flex items-center gap-1 font-semibold px-2 py-1 rounded-lg bg-orange-50 text-orange-500"
                          title="Chuỗi ngày học liên tục"
                        >
                          <Flame size={11} />
                          {stats.streakDays ?? 0} ngày
                        </span>
                        <span
                          className="flex items-center gap-1 font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-500"
                          title="Thời gian học trong tuần"
                        >
                          <Clock size={11} />
                          {stats.weeklyMinutes ?? 0} ph
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full pt-2.5 mt-0.5 border-t border-gray-100/80">
                      <div className="flex items-center justify-center gap-1.5 py-2">
                        <Sparkles size={13} className="text-orange-300" />
                        <span className="text-[11px] text-gray-300 font-medium">
                          Chưa có dữ liệu học
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="w-full px-5 pb-4">
                  <div
                    className="w-full py-2 rounded-xl text-[11px] font-bold text-center transition-all duration-300"
                    style={{
                      background: isHovered
                        ? "linear-gradient(135deg, var(--brand-primary), #f97316)"
                        : "#f3f4f6",
                      color: isHovered ? "white" : "#9ca3af",
                      boxShadow: isHovered ? "0 2px 8px rgba(249,115,22,0.25)" : "none",
                    }}
                  >
                    {isHovered ? "Bắt đầu học! 🚀" : "Nhấn để chọn →"}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add child card - inline with profiles */}
          <button
            onClick={() => navigate("/add-child")}
            className="group flex flex-col items-center justify-center gap-3 p-5 bg-white/50 backdrop-blur-sm rounded-[1.8rem] shadow-md border-2 border-dashed border-gray-200/80 hover:border-orange-300 hover:bg-white/80 hover:shadow-xl hover:-translate-y-3 active:translate-y-0 transition-all duration-300 w-56 cursor-pointer min-h-[280px]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted
                ? "translateY(0) scale(1)"
                : "translateY(30px) scale(0.9)",
              transition: `opacity 500ms ease-out ${300 + profiles.length * 120}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + profiles.length * 120}ms, border-color 200ms, box-shadow 200ms`,
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-100/80 group-hover:bg-orange-50 group-hover:scale-110 transition-all duration-300">
              <Plus
                size={28}
                strokeWidth={2.5}
                className="text-gray-300 group-hover:text-orange-400 group-hover:rotate-90 transition-all duration-300"
              />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-400 group-hover:text-gray-700 text-sm transition-colors">
                Thêm bé mới
              </p>
              <p className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors mt-0.5">
                Tạo hồ sơ học sinh mới
              </p>
            </div>
          </button>
        </div>

        {/* ── Parent Dashboard Button ── */}
        <div
          className="w-full max-w-lg mb-4 transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transitionDelay: `${300 + (profiles.length + 1) * 120}ms`,
          }}
        >
          <button
            onClick={() => setShowPinGate(true)}
            className="group w-full flex items-center gap-4 px-6 py-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm rounded-2xl shadow-md border-2 border-blue-200/60 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 group-hover:bg-blue-200 transition-all duration-300 shrink-0">
              <BarChart3
                size={24}
                strokeWidth={1.8}
                className="text-blue-500 group-hover:text-blue-600 transition-all duration-300"
              />
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm px-1 animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-blue-600 group-hover:text-blue-700 text-sm transition-colors">
                Góc Phụ Huynh
              </p>
              <p className="text-[11px] text-blue-400 group-hover:text-blue-500 transition-colors leading-snug">
                Xem tiến độ học, thống kê & quản lý gói
              </p>
            </div>
            <ShieldCheck
              size={16}
              className="text-blue-300 group-hover:text-blue-400 shrink-0"
            />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            sessionStorage.removeItem("vio_parent_id");
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 mt-4 px-5 py-2.5 rounded-2xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200 font-medium"
          style={{
            opacity: mounted ? 1 : 0,
            transition: `opacity 600ms ease-out ${300 + (profiles.length + 2) * 120 + 200}ms`,
          }}
        >
          <LogOut size={15} />
          Đăng xuất
        </button>
      </div>

      {/* Parent Gate modal */}
      {showPinGate && (
        <ParentGate
          onSuccess={handleParentUnlocked}
          onClose={() => setShowPinGate(false)}
        />
      )}
    </div>
  );
}
