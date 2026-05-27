import { useState } from "react";
import { ArrowLeft, ShieldCheck, Star, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { type PlanType } from "@/shared/types/dashboard";
import { useAuth } from "@/shared/lib/auth";
import { ParentGate } from "@/shared/ui/ParentGate";
import { useActiveChild } from "@/shared/lib/activeChild";

const PLAN_CONFIG: Record<
  PlanType,
  { label: string; icon: string; gradient: string; glow: string }
> = {
  FREE: {
    label: "Cơ Bản",
    icon: "🌱",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-400/30",
  },
  PRO: {
    label: "Nâng Cao",
    icon: "🚀",
    gradient: "from-blue-400 to-indigo-500",
    glow: "shadow-blue-400/30",
  },
  VIP: {
    label: "VIP",
    icon: "👑",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-400/30",
  },
};

/** XP needed to reach next level */
function getLevelInfo(xp: number) {
  const level = Math.max(1, Math.floor(xp / 30) + 1);
  const xpThisLevel = xp % 30;
  const xpToNext = 30;
  return { level, xpThisLevel, xpToNext };
}

interface KidsTopbarProps {
  backTo?: string;
}

export function KidsTopbar({ backTo = "/student" }: KidsTopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveRole } = useAuth();
  const { activeChild, dashboardData } = useActiveChild();
  const [showPinGate, setShowPinGate] = useState(false);

  const isOnMap = location.pathname === "/student";

  const profile = {
    emoji: activeChild?.avatarEmoji || "🦊",
    name: activeChild?.name || "Bé Yêu",
  };
  const plan = activeChild?.plan || "FREE";
  const xp = dashboardData?.stats?.overallScore || 0;

  const { level, xpThisLevel, xpToNext } = getLevelInfo(xp);
  const lvlPct = Math.round((xpThisLevel / xpToNext) * 100);
  const planInfo = PLAN_CONFIG[plan];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Main bar ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
        }}
      >
        {/* Subtle decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 right-20 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-1 right-1/3 w-16 h-16 rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative flex items-center justify-between px-3 sm:px-5 py-2 max-w-5xl mx-auto gap-2 sm:gap-3">
          {/* ═══ LEFT GROUP ═══ */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Back button */}
            {!isOnMap && (
              <button
                onClick={() => navigate(backTo)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md border border-white/20 text-white font-bold text-xs rounded-xl px-3 py-2 transition-all active:scale-95 select-none"
              >
                <ArrowLeft size={15} strokeWidth={2.5} />
                <span className="hidden sm:inline text-[13px]">Trang chủ</span>
              </button>
            )}

            {/* XP Pill */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl px-3 py-1.5 shadow-lg shadow-amber-500/25 select-none">
              <Star size={13} className="text-white fill-white" />
              <span className="text-white font-extrabold text-xs tabular-nums leading-none">
                {xp} XP
              </span>
            </div>
          </div>

          {/* ═══ CENTER: Level progress (desktop) ═══ */}
          <div className="hidden sm:flex flex-1 max-w-[220px] flex-col gap-0.5 mx-2">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-[10px] font-bold flex items-center gap-1">
                <Zap size={10} className="text-yellow-300" />
                Lv.{level}
              </span>
              <span className="text-white/50 text-[10px] font-semibold tabular-nums">
                {xpToNext - xpThisLevel} XP nữa
              </span>
            </div>
            {/* Progress track */}
            <div className="h-2 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.max(lvlPct, 4)}%`,
                  background: "linear-gradient(90deg, #facc15, #f97316)",
                  boxShadow: "0 0 8px rgba(250, 204, 21, 0.5)",
                }}
              />
            </div>
          </div>

          {/* ═══ RIGHT GROUP ═══ */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Plan badge */}
            <div
              className={`flex items-center gap-1 bg-gradient-to-r ${planInfo.gradient} rounded-xl px-2.5 py-1.5 shadow-md ${planInfo.glow} select-none`}
            >
              <span className="text-xs leading-none">{planInfo.icon}</span>
              <span className="text-white font-bold text-[11px] leading-none hidden sm:inline">
                {planInfo.label}
              </span>
            </div>

            {/* Avatar card */}
            <div className="relative flex items-center gap-2 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl pl-1 pr-2.5 py-1 select-none transition-all cursor-default">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base leading-none border-2 border-white/60"
                  style={{
                    background: `linear-gradient(135deg, ${
                      activeChild?.avatarBg || "#fed7aa"
                    }, ${activeChild?.avatarBg || "#fdba74"})`,
                  }}
                >
                  {profile.emoji}
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-[1.5px] border-white rounded-full" />
              </div>

              {/* Name + level */}
              <div className="hidden sm:flex flex-col leading-none gap-0.5">
                <span className="text-white font-bold text-xs leading-none max-w-[80px] truncate">
                  {profile.name}
                </span>
                <span className="text-white/60 text-[9px] font-semibold">
                  Cấp độ {level}
                </span>
              </div>

              {/* Level badge */}
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-violet-400 to-purple-600 text-white text-[9px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-[1.5px] border-white shadow-sm shadow-purple-500/30">
                {level}
              </span>
            </div>

            {/* Parent button */}
            <button
              onClick={() => setShowPinGate(true)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md border border-white/20 text-white font-bold text-[11px] rounded-xl px-2.5 py-2 transition-all active:scale-95 select-none"
              title="Góc Phụ Huynh"
            >
              <ShieldCheck size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Phụ Huynh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Soft bottom edge ── */}
      <div
        className="h-1"
        style={{
          background: "linear-gradient(to bottom, rgba(99,102,241,0.15), transparent)",
        }}
      />

      {/* Parent Gate modal */}
      {showPinGate && (
        <ParentGate
          onSuccess={() => {
            setShowPinGate(false);
            setActiveRole("parent");
            navigate("/dashboard");
          }}
          onClose={() => setShowPinGate(false)}
        />
      )}
    </header>
  );
}
