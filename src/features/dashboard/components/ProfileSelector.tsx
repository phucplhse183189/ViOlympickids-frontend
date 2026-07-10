import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Check } from "lucide-react";
import { useActiveChild } from "@/features/dashboard/context/activeChild";

// ─── Avatar bubble ────────────────────────────────────────────
function AvatarBubble({
  emoji,
  bg,
  size = "md",
}: {
  emoji: string;
  bg: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-lg",
    lg: "w-14 h-14 text-3xl",
  };
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center shrink-0 select-none`}
      style={{ backgroundColor: bg || "#f3f4f6" }}
    >
      {emoji}
    </div>
  );
}

// ─── ProfileSelector (main export) ───────────────────────────
export function ProfileSelector() {
  const navigate = useNavigate();
  const { profiles, activeChild, switchChild, refreshProfiles } =
    useActiveChild();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProfile = activeChild;

  // Re-read localStorage when window regains focus (after returning from /add-child)
  useEffect(() => {
    const onFocus = () => {
      refreshProfiles();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshProfiles]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  if (!profiles.length) {
    return null;
  }

  if (!activeProfile) return <div className="mx-4 mt-4 mb-2 text-sm text-gray-500">Đang tải...</div>;

  return (
    <div ref={dropdownRef} className="relative mx-4 mt-4 mb-2">
      {/* Trigger button */}
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          dropdownOpen
            ? "bg-blue-50 border-blue-200"
            : "bg-orange-50 border-orange-100 hover:border-orange-300"
        }`}
      >
        <AvatarBubble
          emoji={activeProfile.avatarEmoji}
          bg={activeProfile.avatarBg || "#f3f4f6"}
          size="md"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-bold text-gray-800 truncate leading-tight">
            {activeProfile.name}
          </p>
          {/* Grade badge */}
          <span className="inline-block mt-0.5 text-[10px] font-extrabold bg-orange-400 text-white px-1.5 py-0.5 rounded-full leading-none">
            {activeProfile.grade}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-fade-in-up">
          {/* Profile list */}
          <div className="py-1.5">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  switchChild(profile.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                  profile.id === activeProfile.id ? "bg-blue-50" : ""
                }`}
              >
                <AvatarBubble
                  emoji={profile.avatarEmoji}
                  bg={profile.avatarBg || "#f3f4f6"}
                  size="sm"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-orange-500 font-semibold">
                    {profile.grade}
                  </p>
                </div>
                {profile.id === activeProfile.id && (
                  <Check size={13} className="text-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Add profile button */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              navigate("/add-child");
            }}
            className="w-full flex items-center gap-2 px-3 py-3 hover:bg-orange-50 transition-colors"
            style={{ color: "var(--brand-primary)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#fff7ed" }}
            >
              <Plus size={14} style={{ color: "var(--brand-primary)" }} />
            </div>
            <span className="text-xs font-bold">Thêm hồ sơ bé</span>
          </button>
        </div>
      )}
    </div>
  );
}
