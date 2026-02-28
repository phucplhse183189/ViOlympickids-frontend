import { useState, useRef, useEffect } from "react";
import { Settings, Check, LogOut, Pencil, X } from "lucide-react";
import { useLang, type Language } from "@/shared/lib/i18n";
import { useAuth, AVATARS } from "@/shared/lib/auth";

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "vi", flag: "VN", label: "Tiếng Việt" },
  { code: "en", flag: "EN", label: "English" },
];

export function SettingsDropdown() {
  const { lang, t, setLang } = useLang();
  const { user, logout, updateUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingNickname(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentAvatar =
    AVATARS.find((a) => a.id === user?.avatarId)?.emoji ?? "🦊";

  const handleSaveNickname = () => {
    const trimmed = nicknameInput.trim();
    if (trimmed) updateUser({ nickname: trimmed });
    setEditingNickname(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Gear button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg
          border transition-all duration-200 select-none
          ${
            open
              ? "border-blue-300 bg-blue-50 text-blue-600 shadow-sm"
              : "border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300 text-gray-500 hover:text-gray-800 hover:shadow-sm"
          }`}
        title={t.settings.title}
        aria-label={t.settings.title}
      >
        <Settings
          size={16}
          className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-gray-100
            bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-[100]
            animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* ── Header ── */}
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t.settings.title}
            </p>
          </div>

          {user && (
            <>
              {/* ── User info ── */}
              <div className="px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-pink-100
                    border-2 border-white shadow flex items-center justify-center text-2xl shrink-0"
                  >
                    {currentAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingNickname ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveNickname();
                            if (e.key === "Escape") setEditingNickname(false);
                          }}
                          className="flex-1 text-sm font-bold text-gray-800 bg-blue-50 border border-blue-200
                            rounded-lg px-2 py-0.5 focus:outline-none focus:border-blue-400 min-w-0"
                        />
                        <button
                          onClick={handleSaveNickname}
                          className="text-blue-500 hover:text-blue-700 p-0.5"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingNickname(false)}
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {user.nickname}
                        </p>
                        <button
                          onClick={() => {
                            setNicknameInput(user.nickname);
                            setEditingNickname(true);
                          }}
                          className="text-gray-300 hover:text-blue-400 transition-colors shrink-0"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Avatar picker */}
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Nhân vật
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => updateUser({ avatarId: av.id })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-150
                        ${
                          user.avatarId === av.id
                            ? "bg-blue-100 ring-2 ring-blue-400 scale-110"
                            : "hover:bg-gray-100"
                        }`}
                      title={av.id}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Language section ── */}
          <div className="p-2">
            <p className="px-2 pb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t.settings.language}
            </p>
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                onClick={() => {
                  setLang(lng.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-150
                  ${
                    lang === lng.code
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className="text-xs font-bold w-5 text-center shrink-0 tracking-tight">
                  {lng.flag}
                </span>
                <span className="flex-1 text-left">{lng.label}</span>
                {lang === lng.code && (
                  <Check size={14} className="text-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* ── Logout ── */}
          {user && (
            <div className="p-2 pt-0">
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                  text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
