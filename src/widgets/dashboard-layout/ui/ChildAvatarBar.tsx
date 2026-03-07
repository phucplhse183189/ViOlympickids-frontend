import { useNavigate } from "react-router-dom";
import { Plus, Crown, Zap } from "lucide-react";
import { useActiveChild } from "@/shared/lib/activeChild";
import type { PlanType } from "@/shared/api/dashboardMockData";

const PLAN_BADGE: Record<
  PlanType,
  { label: string; color: string; icon?: React.ReactNode } | null
> = {
  FREE: null,
  PRO: { label: "PRO", color: "bg-orange-500", icon: <Zap size={8} /> },
  VIP: {
    label: "VIP",
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    icon: <Crown size={8} />,
  },
};

export function ChildAvatarBar() {
  const { profiles, activeChild, switchChild } = useActiveChild();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
      <span className="text-xs text-gray-400 font-semibold mr-1 hidden sm:inline whitespace-nowrap">
        Đang xem:
      </span>
      <div className="flex items-center gap-1.5">
        {profiles.map((profile) => {
          const isActive = profile.id === activeChild.id;
          const badge = PLAN_BADGE[profile.plan];
          return (
            <button
              key={profile.id}
              onClick={() => switchChild(profile.id)}
              title={`${profile.name} — ${profile.grade} (${profile.plan})`}
              className={`relative group flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 border-2 border-blue-400 shadow-sm"
                  : "border-2 border-transparent hover:bg-gray-50 hover:border-gray-200"
              }`}
            >
              {/* Avatar circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 transition-transform duration-200 ${
                  isActive
                    ? "scale-110 ring-2 ring-blue-300 ring-offset-1"
                    : "group-hover:scale-105"
                }`}
                style={{ backgroundColor: profile.avatarBg }}
              >
                {profile.avatarEmoji}
              </div>

              {/* Name (shown for active) */}
              <div
                className={`text-left ${isActive ? "block" : "hidden sm:block"}`}
              >
                <p
                  className={`text-xs font-bold leading-tight ${isActive ? "text-blue-700" : "text-gray-600"}`}
                >
                  {profile.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">
                    {profile.grade}
                  </span>
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-full ${badge.color}`}
                    >
                      {badge.icon} {badge.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}

        {/* Add child mini button */}
        <button
          onClick={() => navigate("/add-child")}
          title="Thêm hồ sơ bé"
          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-orange-400 hover:border-orange-300 transition-all duration-200 shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
