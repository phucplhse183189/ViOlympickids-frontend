import { useState, useEffect } from "react";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/features/auth/context/auth";
import { AVATARS } from "@/features/auth/context/auth";
import { SettingsDropdown } from "@/shared/ui/SettingsDropdown";
import { Link } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";

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
    { href: "/community", label: t.nav.community },
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
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/60 bg-white/82 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none"
            : "border-transparent bg-transparent dark:bg-slate-900"
        }`}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:gap-5">
          {/* ── Logo (trái) ── */}
          <BrandMark />

          {/* ── Nav Pill (giữa) ── */}
          <nav
            className={`mx-3 hidden max-w-max flex-1 items-center justify-center gap-1 rounded-2xl border p-1.5 backdrop-blur-md transition-all duration-300 lg:flex xl:mx-6 ${scrolled ? "border-gray-200/70 bg-gray-100/75 shadow-sm dark:border-slate-700 dark:bg-slate-900/90" : "border-white/60 bg-white/40 shadow-[0_8px_30px_rgba(30,64,175,0.06)] dark:border-slate-700 dark:bg-slate-900/70"}`}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3.5 py-2 text-[15px] font-semibold leading-5 text-slate-600 dark:text-slate-300 xl:px-4.5 xl:py-2.5
                  hover:text-slate-950 hover:bg-white/90 dark:hover:bg-slate-800 dark:hover:text-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15
                  transition-all duration-200 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Actions (phải) ── */}
          <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
            {user ? (
              /* Avatar button (logged in) */
              <Link
                to="/profile-picker"
                title={lang === "vi" ? "Quay lại trang chọn hồ sơ" : "Return to profile selection"}
                className="hidden items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 dark:hover:bg-slate-800 md:flex"
              >
                <span className="text-sm font-semibold text-gray-600 hidden lg:block">
                  {user.nickname}
                </span>
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-pink-100
                  border-2 border-white shadow flex items-center justify-center text-xl select-none"
                >
                  {userAvatar}
                </div>
              </Link>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold md:inline-flex lg:h-11 lg:px-5
                    text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300
                    bg-white/80 hover:bg-white hover:shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {t.login}
                </Link>

                {/* Register CTA */}
                <Link
                  to="/register"
                  className="hidden h-10 items-center gap-2 rounded-xl px-4.5 text-sm font-bold text-white md:inline-flex lg:h-11 lg:px-5
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
                </Link>
              </>
            )}

            {/* Settings (language, profile etc.) */}
            <SettingsDropdown />

            {/* Mobile hamburger */}
            <button
              className="flex h-9 w-9 flex-col items-center justify-center rounded-lg lg:hidden
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
            className="mx-4 mb-4 overflow-hidden rounded-2xl border border-gray-100 sm:mx-6
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
                <Link to="/profile-picker" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 transition hover:bg-blue-100">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-2xl shrink-0">
                    {userAvatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {user.nickname}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold text-gray-700
                      border-2 border-gray-200 hover:border-gray-300 bg-white
                      hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
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
                  </Link>
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
