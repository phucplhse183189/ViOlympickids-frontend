import { useEffect, useState } from "react";
import { ArrowLeft, Map } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CHILD_PROFILES_STORAGE_KEY,
  ACTIVE_CHILD_ID_KEY,
} from "@/shared/api/dashboardMockData";
import { getTotalXP } from "@/shared/api/studentMockData";

interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatarEmoji: string;
  avatarBg: string;
}

interface KidsTopbarProps {
  backTo?: string;
}

function getActiveProfile(
  fallbackEmoji = "🦊",
  fallbackName = "Bé Yêu",
): { emoji: string; name: string } {
  try {
    const activeId = localStorage.getItem(ACTIVE_CHILD_ID_KEY);
    const raw = localStorage.getItem(CHILD_PROFILES_STORAGE_KEY);
    if (raw && activeId) {
      const profiles = JSON.parse(raw) as ChildProfile[];
      const match = profiles.find((p) => p.id === activeId) ?? profiles[0];
      if (match) return { emoji: match.avatarEmoji, name: match.name };
    }
    if (raw) {
      const profiles = JSON.parse(raw) as ChildProfile[];
      if (profiles.length > 0)
        return { emoji: profiles[0].avatarEmoji, name: profiles[0].name };
    }
  } catch {
    // ignore
  }
  return { emoji: fallbackEmoji, name: fallbackName };
}

/** XP needed to reach next level */
function getLevelInfo(xp: number) {
  const level = Math.max(1, Math.floor(xp / 30) + 1);
  const xpThisLevel = xp % 30;
  const xpToNext = 30;
  return { level, xpThisLevel, xpToNext };
}

export function KidsTopbar({ backTo = "/student" }: KidsTopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(() => getActiveProfile());
  const [xp, setXp] = useState(() => getTotalXP());

  // Hide the back button when already on the map page
  const isOnMap = location.pathname === "/student";

  useEffect(() => {
    const refresh = () => {
      setProfile(getActiveProfile());
      setXp(getTotalXP());
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const { level, xpThisLevel, xpToNext } = getLevelInfo(xp);
  const lvlPct = Math.round((xpThisLevel / xpToNext) * 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient bar */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 shadow-lg shadow-sky-300/40">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-4xl mx-auto gap-3">

          {/* ── LEFT: Back button (hidden on map page) ── */}
          {isOnMap ? (
            <div className="shrink-0 w-10" />
          ) : (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm border border-white/40 text-white font-extrabold text-sm rounded-2xl px-4 py-2.5 transition-all active:scale-95 select-none shrink-0"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              <Map size={16} strokeWidth={2.5} className="hidden xs:block" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          )}

          {/* ── CENTER: XP + Level bar ── */}
          <div className="flex-1 max-w-xs hidden sm:flex flex-col gap-1">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-white/90 text-[11px] font-extrabold flex items-center gap-1">
                ⭐ <span className="tabular-nums">{xp} XP</span>
              </span>
              <span className="text-white/70 text-[10px] font-bold">
                Lv.{level} → {xpToNext - xpThisLevel} XP nữa
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2.5 bg-white/25 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${lvlPct}%` }}
              />
            </div>
          </div>

          {/* ── RIGHT: XP pill + Avatar ── */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* XP pill (mobile only) */}
            <div className="sm:hidden flex items-center gap-1.5 bg-yellow-400 rounded-2xl px-3.5 py-2 shadow-[0_3px_0_#b45309] select-none">
              <span className="text-lg leading-none">⭐</span>
              <span className="text-white font-extrabold text-base leading-none tabular-nums">{xp}</span>
            </div>

            {/* Avatar card */}
            <div className="relative flex items-center gap-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl pl-1.5 pr-3.5 py-1.5 select-none transition-all cursor-default">
              {/* Avatar ring */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-xl leading-none shadow-md border-2 border-white/80">
                  {profile.emoji}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </div>

              {/* Name + level */}
              <div className="hidden sm:flex flex-col leading-none gap-0.5">
                <span className="text-white font-extrabold text-sm leading-none">{profile.name}</span>
                <span className="text-white/70 text-[10px] font-bold">Cấp độ {level}</span>
              </div>

              {/* Level badge */}
              <span className="absolute -top-2 -right-1.5 bg-gradient-to-br from-purple-400 to-purple-600 text-white text-[10px] font-extrabold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white shadow-sm">
                {level}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
