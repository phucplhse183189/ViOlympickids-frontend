import { useState, useEffect } from "react";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth";
import { AVATARS } from "@/shared/lib/auth";
import { SettingsDropdown } from "@/shared/ui/SettingsDropdown";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, t, setLang } = useLang();
  const { user } = useAuth();

  const userAvatar =
    AVATARS.find((a) => a.id === user?.avatarId)?.emoji ?? "🦊";

  const navLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#courses", label: t.nav.courses },
    { href: "#reviews", label: t.nav.reviews },
    { href: "#contact", label: t.nav.contact },
  ];

  const currentLangLabel = lang === "vi" ? "🇻🇳 Tiếng Việt" : "🌐 English";
  const nextLangLabel = lang === "vi" ? "🌐 English" : "🇻🇳 Tiếng Việt";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_2px_32px_rgba(0,0,0,0.10)] border-b border-white/60"
            : "bg-white/60 backdrop-blur-md border-b border-white/40"
        }`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* ── Logo (trái) ── */}
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 group select-none"
          >
            <img
              src="/robot-head.png"
              alt="ViOlympicKids"
              className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-[1.05rem] font-extrabold tracking-tight whitespace-nowrap leading-none">
              <span className="text-blue-500">ViOlympic</span>
              <span style={{ color: "var(--brand-primary)" }}>Kids</span>
            </span>
          </a>

          {/* ── Nav Pill (giữa) ── */}
          <nav className="hidden lg:flex items-center justify-center p-1 rounded-xl bg-gray-100/70 backdrop-blur-sm border border-gray-200/60 gap-0.5 flex-1 max-w-max mx-4 xl:mx-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 xl:px-4 py-1.5 text-sm font-semibold text-gray-500 rounded-lg
                  hover:text-gray-900 hover:bg-white hover:shadow-sm
                  transition-all duration-200 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Actions (phải) ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user ? (
              /* Avatar button (logged in) */
              <div className="hidden md:flex items-center gap-2.5">
                <span className="text-sm font-semibold text-gray-600 hidden lg:block">
                  {user.nickname}
                </span>
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-pink-100
                  border-2 border-white shadow flex items-center justify-center text-xl select-none"
                >
                  {userAvatar}
                </div>
              </div>
            ) : (
              <>
                {/* Login */}
                <a
                  href="/login"
                  className="hidden md:inline-flex items-center h-10 px-4 rounded-lg text-sm font-semibold
                    text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300
                    bg-white/80 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  {t.login}
                </a>

                {/* Register CTA */}
                <a
                  href="/register"
                  className="hidden md:inline-flex items-center gap-1.5 h-10 px-4.5 rounded-lg text-sm font-bold text-white
                    transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6F61 0%, #ff9a8b 100%)",
                    boxShadow:
                      "0 4px 16px rgba(255,111,97,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "0 8px 24px rgba(255,111,97,0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      "0 4px 16px rgba(255,111,97,0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                  }}
                >
                  <span>{t.register}</span>
                  <span className="text-base leading-none">🚀</span>
                </a>
              </>
            )}

            {/* Settings (language, profile etc.) */}
            <SettingsDropdown />

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 rounded-lg
                text-gray-600 hover:bg-gray-100 transition-all duration-200 gap-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className="block h-0.5 bg-current rounded-full transition-all duration-300 w-5"
                style={{
                  transform: menuOpen
                    ? "rotate(45deg) translate(1px, 8px)"
                    : "",
                }}
              />
              <span
                className="block h-0.5 bg-current rounded-full transition-all duration-300 w-5"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 bg-current rounded-full transition-all duration-300 w-5"
                style={{
                  transform: menuOpen
                    ? "rotate(-45deg) translate(1px, -8px)"
                    : "",
                }}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div
            className="mx-3 mb-4 rounded-2xl overflow-hidden border border-gray-100
            shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
          >
            {/* Nav items */}
            <div className="p-2 flex flex-col gap-0.5 border-b border-gray-50">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl
                    font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50
                    transition-colors duration-200 group"
                >
                  <span>{link.label}</span>
                  <span className="text-gray-300 group-hover:text-gray-400 text-sm transition-colors">
                    →
                  </span>
                </a>
              ))}
            </div>

            {/* CTA area */}
            <div className="p-3 flex flex-col gap-2">
              {user ? (
                /* Logged in: show avatar + nickname */
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-2xl shrink-0">
                    {userAvatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {user.nickname}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold text-gray-700
                      border-2 border-gray-200 hover:border-gray-300 bg-white
                      hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    {t.login}
                  </a>
                  <a
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold text-white text-sm
                      transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF6F61 0%, #ff9a8b 100%)",
                      boxShadow: "0 4px 12px rgba(255,111,97,0.4)",
                    }}
                  >
                    {t.register} 🚀
                  </a>
                </>
              )}
              {/* Mobile Language Toggle */}
              <button
                onClick={() => setLang(lang === "vi" ? "en" : "vi")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold
                  text-gray-600 border border-gray-200 bg-white hover:bg-gray-50
                  transition-all duration-200 text-sm"
              >
                <span>{currentLangLabel}</span>
                <span className="text-gray-400">→</span>
                <span>{nextLangLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
