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
} from "lucide-react";
import { useAuth } from "@/shared/lib/auth";
import { ParentGate } from "@/shared/ui/ParentGate";
import { useActiveChild } from "@/shared/lib/activeChild";
import * as childrenService from "@/shared/api/services/childrenService";
import type { DashboardData, ChildProfile } from "@/shared/api/services/childrenService";

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function ProfilePickerPage() {
  const navigate = useNavigate();
  const { user, setActiveRole, logout } = useAuth();
  const { profiles, isLoading, switchChild, refreshProfiles } = useActiveChild();
  const [showPinGate, setShowPinGate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [childStats, setChildStats] = useState<Record<string, DashboardData>>({});

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
  const totalCards = profiles.length + 2;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient-x"
        style={{
          background:
            "linear-gradient(135deg, #dbeafe 0%, #fef9c3 25%, #d1fae5 50%, #e0e7ff 75%, #fce7f3 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-12 left-[6%] w-20 h-20 rounded-full bg-yellow-300/30 animate-float-slow blur-sm" />
      <div
        className="absolute top-1/3 right-[3%] w-14 h-14 rounded-full bg-pink-300/30 animate-float-slow blur-sm"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-16 left-[15%] w-10 h-10 rounded-full bg-blue-300/30 animate-float-slow blur-sm"
        style={{ animationDelay: "0.8s" }}
      />
      <div
        className="absolute bottom-1/4 right-[12%] w-16 h-16 rounded-full bg-green-200/30 animate-float-slow blur-sm"
        style={{ animationDelay: "2s" }}
      />
      {/* Sparkles */}
      <div className="absolute top-[15%] right-[8%] text-4xl opacity-15 animate-pulse-slow">
        ✨
      </div>
      <div
        className="absolute bottom-[20%] left-[5%] text-3xl opacity-10 animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />
      {/* Spinning ring */}
      <div className="absolute -top-24 -left-24 w-64 h-64 border-2 border-dashed border-blue-200/20 rounded-full animate-spin-slow" />
      <div
        className="absolute -bottom-20 -right-20 w-48 h-48 border-2 border-dashed border-pink-200/20 rounded-full animate-spin-slow"
        style={{ animationDirection: "reverse" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-10">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 mb-5 transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center">
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
          className="text-center mb-8 transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(15px)",
            transitionDelay: "150ms",
          }}
        >
          <p className="text-sm text-gray-400 mb-1.5">
            {greeting},{" "}
            <span className="font-bold text-gray-600">{user.nickname}</span> 👋
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
            Chọn hồ sơ để bắt đầu
          </h1>
          <p className="text-gray-400 text-sm">
            Nhấn vào tên bé để vào trang học, hoặc vào{" "}
            <span className="font-semibold text-blue-400">Góc Phụ Huynh</span>{" "}
            để xem tiến độ
          </p>
        </div>

        {/* ── Section: Child profiles ── */}
        <p
          className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 transition-all duration-500"
          style={{
            opacity: mounted ? 1 : 0,
            transitionDelay: "250ms",
          }}
        >
          Hồ sơ bé
        </p>

        <div className="flex flex-wrap gap-5 justify-center max-w-4xl mb-6">
          {isLoading ? (
             <div className="text-gray-500">Đang tải hồ sơ...</div>
          ) : profiles.map((profile, i) => {
            const dash = childStats[profile.id];
            const stats = dash?.stats;
            const score = stats?.overallScore ?? 0;
            return (
              <button
                key={profile.id}
                onClick={() => selectChild(profile)}
                className="group flex flex-col items-center gap-3 p-5 pb-4 bg-white/90 backdrop-blur-sm rounded-[1.8rem] shadow-lg border-2 border-white/80 hover:border-orange-300 hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 active:shadow-lg transition-all duration-300 w-52 cursor-pointer"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted
                    ? "translateY(0) scale(1)"
                    : "translateY(30px) scale(0.9)",
                  transition: `opacity 500ms ease-out ${300 + i * 120}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + i * 120}ms, border-color 200ms, box-shadow 200ms`,
                }}
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-[1.2rem] opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-lg"
                    style={{ backgroundColor: profile.avatarBg || "#f3f4f6" }}
                  />
                  <div
                    className="relative rounded-[1.2rem] flex items-center justify-center text-5xl shadow-md group-hover:scale-110 group-hover:rotate-3 group-active:scale-95 transition-all duration-300 border-3 border-white/60"
                    style={{
                      backgroundColor: profile.avatarBg || "#f3f4f6",
                      width: "5rem",
                      height: "5rem",
                    }}
                  >
                    {profile.avatarEmoji}
                  </div>
                </div>

                {/* Name + badges */}
                <div className="text-center space-y-1">
                  <p className="font-extrabold text-gray-800 text-base group-hover:text-orange-600 transition-colors">
                    {profile.name}
                  </p>
                  <div className="flex items-center gap-1.5 justify-center flex-wrap">
                    <span className="inline-block text-[10px] font-extrabold bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      {profile.grade}
                    </span>
                    {profile.plan === "VIP" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-2 py-0.5 rounded-full">
                        <Crown size={10} /> VIP
                      </span>
                    )}
                    {profile.plan === "PRO" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                        <Zap size={10} /> Pro
                      </span>
                    )}
                    {profile.plan === "FREE" && (
                      <span className="inline-block text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                        Miễn phí
                      </span>
                    )}
                  </div>
                  {profile.plan !== "FREE" && profile.planDaysLeft != null && (
                    <p className="text-[10px] text-gray-300">
                      Còn {profile.planDaysLeft} ngày
                    </p>
                  )}
                </div>

                {/* Quick stats */}
                {stats && (
                  <div className="w-full border-t border-gray-100 pt-2.5 mt-1">
                    {/* Score progress bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, score)}%`,
                            background:
                              score >= 80
                                ? "linear-gradient(90deg, #22c55e, #4ade80)"
                                : score >= 50
                                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                  : "linear-gradient(90deg, #ef4444, #f87171)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">
                        {score}đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 gap-1">
                      <span
                        className="flex items-center gap-0.5"
                        title="Chuỗi ngày học liên tục"
                      >
                        <Flame size={11} className="text-orange-400" />
                        {stats.streakDays ?? 0} ngày
                      </span>
                      <span
                        className="flex items-center gap-0.5"
                        title="Thời gian học trong tuần"
                      >
                        <Clock size={11} className="text-blue-400" />
                        {stats.weeklyMinutes ?? 0} ph
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover hint */}
                <p className="text-[10px] text-gray-300 group-hover:text-orange-400 transition-colors mt-0.5">
                  Nhấn để bé bắt đầu học →
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Section: Actions ── */}
        <p
          className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 transition-all duration-500"
          style={{
            opacity: mounted ? 1 : 0,
            transitionDelay: `${300 + profiles.length * 120 + 100}ms`,
          }}
        >
          Quản lý
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl w-full mb-2">
          {/* Parent dashboard – prominent */}
          <button
            onClick={() => setShowPinGate(true)}
            className="group flex-1 flex items-center gap-4 px-6 py-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm rounded-2xl shadow-md border-2 border-blue-200/60 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.95)",
              transition: `opacity 500ms ease-out ${300 + profiles.length * 120 + 150}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + profiles.length * 120 + 150}ms, border-color 200ms, box-shadow 200ms`,
            }}
          >
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 group-hover:bg-blue-200 transition-all duration-300 shrink-0">
              <BarChart3
                size={24}
                strokeWidth={1.8}
                className="text-blue-500 group-hover:text-blue-600 transition-all duration-300"
              />
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm px-1">
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

          {/* Add child */}
          <button
            onClick={() => navigate("/add-child")}
            className="group flex items-center gap-3 px-5 py-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow border-2 border-dashed border-gray-200/80 hover:border-orange-300 hover:bg-white/90 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.95)",
              transition: `opacity 500ms ease-out ${300 + profiles.length * 120 + 250}ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + profiles.length * 120 + 250}ms, border-color 200ms, box-shadow 200ms`,
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100/80 group-hover:bg-orange-50 transition-all duration-300">
              <Plus
                size={22}
                strokeWidth={2.5}
                className="text-gray-300 group-hover:text-orange-400 group-hover:rotate-90 transition-all duration-300"
              />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-500 group-hover:text-gray-700 text-sm transition-colors">
                Thêm bé
              </p>
              <p className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors">
                Tạo hồ sơ học sinh mới
              </p>
            </div>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            sessionStorage.removeItem("vio_parent_id");
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 mt-8 px-5 py-2.5 rounded-2xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200 font-medium"
          style={{
            opacity: mounted ? 1 : 0,
            transition: `opacity 600ms ease-out ${300 + totalCards * 120 + 400}ms`,
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
