import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X, Check } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatarEmoji: string;
  avatarBg: string;
}

// ─── Mock data (replace with API / context later) ─────────────
// Simulates a family with twins in the same grade
const INITIAL_PROFILES: ChildProfile[] = [
  {
    id: "child-1",
    name: "Bé Tom",
    grade: "Lớp 2",
    avatarEmoji: "🦊",
    avatarBg: "#f97316",
  },
  {
    id: "child-2",
    name: "Bé Jerry",
    grade: "Lớp 2",
    avatarEmoji: "🐱",
    avatarBg: "#3b82f6",
  },
];

// ─── Avatar options for new profile ──────────────────────────
const AVATAR_OPTIONS = [
  { emoji: "🐻", bg: "#a78bfa", label: "Gấu tím" },
  { emoji: "🐶", bg: "#34d399", label: "Cún xanh" },
  { emoji: "🐸", bg: "#f59e0b", label: "Ếch vàng" },
];

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
      style={{ backgroundColor: bg }}
    >
      {emoji}
    </div>
  );
}

// ─── Add Profile Modal ───────────────────────────────────────
function AddProfileModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (profile: Omit<ChildProfile, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // auto-focus input when modal opens
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      grade: "Lớp 2",
      avatarEmoji: AVATAR_OPTIONS[selectedAvatar].emoji,
      avatarBg: AVATAR_OPTIONS[selectedAvatar].bg,
    });
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal card */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-extrabold text-gray-800">
            Thêm hồ sơ bé
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-600 mb-1.5">
            Tên của bé
          </label>
          <input
            ref={inputRef}
            type="text"
            placeholder="VD: Bé Na, Bé Bin..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition placeholder:font-normal placeholder:text-gray-300"
          />
        </div>

        {/* Programme info (fixed grade 2) */}
        <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <span className="text-base">📚</span>
          <p className="text-xs text-gray-400 font-medium">
            Chương trình:{" "}
            <span className="text-gray-600 font-semibold">
              Toán Học Lớp 2 (Mặc định)
            </span>
          </p>
        </div>

        {/* Avatar picker */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 mb-3">
            Chọn avatar cho bé
          </p>
          <div className="flex items-center justify-center gap-4">
            {AVATAR_OPTIONS.map((av, i) => (
              <button
                key={av.label}
                onClick={() => setSelectedAvatar(i)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                  selectedAvatar === i
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-md"
                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <AvatarBubble emoji={av.emoji} bg={av.bg} size="lg" />
                <span className="text-[11px] font-semibold text-gray-500">
                  {av.label}
                </span>
                {selectedAvatar === i && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          style={{
            background: name.trim()
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "#e5e7eb",
            color: name.trim() ? "white" : "#9ca3af",
            boxShadow: name.trim()
              ? "0 4px 14px rgba(59,130,246,0.35)"
              : "none",
          }}
        >
          Lưu hồ sơ
        </button>
      </div>
    </div>
  );
}

// ─── ProfileSelector (main export) ───────────────────────────
export function ProfileSelector() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(INITIAL_PROFILES);
  const [activeId, setActiveId] = useState(INITIAL_PROFILES[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeId) ?? profiles[0];

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

  const handleAddProfile = (data: Omit<ChildProfile, "id">) => {
    const newProfile: ChildProfile = {
      ...data,
      id: `child-${Date.now()}`,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveId(newProfile.id);
  };

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
          bg={activeProfile.avatarBg}
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
                  setActiveId(profile.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                  profile.id === activeId ? "bg-blue-50" : ""
                }`}
              >
                <AvatarBubble
                  emoji={profile.avatarEmoji}
                  bg={profile.avatarBg}
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
                {profile.id === activeId && (
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
              setModalOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Plus size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold">Thêm hồ sơ bé</span>
          </button>
        </div>
      )}

      {/* Add Profile Modal */}
      {modalOpen && (
        <AddProfileModal
          onClose={() => setModalOpen(false)}
          onSave={handleAddProfile}
        />
      )}
    </div>
  );
}
