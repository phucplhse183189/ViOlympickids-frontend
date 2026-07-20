import { useState, useRef, useEffect } from "react";
import { Settings, Check, LogOut, Pencil, X, Sun, Moon, Monitor } from "lucide-react";
import { useLang, type Language } from "@/shared/lib/i18n";
import { useAuth, AVATARS } from "@/features/auth/context/auth";
import { useThemeStore, type ThemeMode } from "@/shared/stores/themeStore";
import { useNavigate } from "react-router-dom";

export function SettingsDropdown() {
  const navigate = useNavigate();
  const { lang, t, setLang } = useLang();
  const { user, logout, updateUser } = useAuth();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [open, setOpen] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const languages: { code: Language; flag: string; label: string }[] = [
    { code: "vi", flag: "VN", label: lang === "vi" ? "Tiếng Việt" : "Vietnamese" },
    { code: "en", flag: "EN", label: "English" },
  ];
  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t.settings.light, icon: Sun },
    { value: "dark", label: t.settings.dark, icon: Moon },
    { value: "system", label: t.settings.system, icon: Monitor },
  ];

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
        className={`hidden h-10 w-10 items-center justify-center rounded-xl md:inline-flex lg:h-11 lg:w-11
          border transition-all duration-200 select-none
          ${
            open
              ? "border-blue-300 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/60 dark:bg-blue-500/15 dark:text-blue-300"
              : "border-gray-200 bg-white/80 text-gray-500 hover:border-gray-300 hover:bg-white hover:text-gray-800 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          }`}
        title={t.settings.title}
        aria-label={t.settings.title}
      >
        <Settings
          size={18}
          className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100
            bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] z-[100]
            animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* ── Header ── */}
          <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {t.settings.title}
            </p>
          </div>

          {user && (
            <>
              {/* ── User info ── */}
              <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-pink-100 text-2xl shadow dark:border-slate-700 dark:from-blue-500/25 dark:to-pink-500/20"
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
                          className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-sm font-bold text-gray-800 focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
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
                        <p className="truncate text-sm font-bold text-gray-800 dark:text-slate-100">
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
                    <p className="truncate text-xs text-gray-400 dark:text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Avatar picker */}
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  {t.settings.avatar}
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => updateUser({ avatarId: av.id })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-150
                        ${
                          user.avatarId === av.id
                            ? "scale-110 bg-blue-100 ring-2 ring-blue-400 dark:bg-blue-500/20"
                            : "hover:bg-gray-100 dark:hover:bg-slate-800"
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
            <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {t.settings.language}
            </p>
            {languages.map((lng) => (
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
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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

          {/* Appearance */}
          <div className="border-t border-gray-100 p-2 dark:border-slate-800">
            <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {t.settings.appearance}
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition-all ${
                    theme === value
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Logout ── */}
          {user && (
            <div className="p-2 pt-0">
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/", { replace: true });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
                  text-red-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              >
                <LogOut size={15} />
                <span>{t.settings.logout}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
