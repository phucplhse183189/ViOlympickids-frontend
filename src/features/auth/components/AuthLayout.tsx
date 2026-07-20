import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { flushSync } from "react-dom";
import { useLang } from "@/shared/lib/i18n";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/* ── Floating item configs ─────────────────────────────────────── */
const FLOAT_ITEMS: {
  content: string;
  x: string;
  y: string;
  size: string;
  color: string;
  darkColor: string;
  dur: number;
  delay: number;
  drift: number;
  rotate: number;
}[] = [
  // Animals
  { content: "🐼", x: "4%",  y: "12%", size: "2.6rem", color: "", darkColor: "", dur: 7,   delay: 0,   drift: -14, rotate: 6 },
  { content: "🦊", x: "88%", y: "18%", size: "2.4rem", color: "", darkColor: "", dur: 8,   delay: 1,   drift: 12,  rotate: -5 },
  { content: "🐸", x: "14%", y: "75%", size: "2.2rem", color: "", darkColor: "", dur: 6.5, delay: 0.5, drift: -10, rotate: 8 },
  { content: "🦁", x: "82%", y: "78%", size: "2.5rem", color: "", darkColor: "", dur: 7.5, delay: 2,   drift: 15,  rotate: -7 },
  { content: "🐬", x: "50%", y: "8%",  size: "2rem",   color: "", darkColor: "", dur: 9,   delay: 1.5, drift: -8,  rotate: 4 },
  { content: "🦋", x: "92%", y: "50%", size: "2.2rem", color: "", darkColor: "", dur: 6,   delay: 0.8, drift: 11,  rotate: -10 },
  { content: "🐧", x: "6%",  y: "45%", size: "2rem",   color: "", darkColor: "", dur: 8.5, delay: 3,   drift: -12, rotate: 5 },
  { content: "🦄", x: "72%", y: "88%", size: "2.3rem", color: "", darkColor: "", dur: 7,   delay: 1.2, drift: 9,   rotate: -4 },
  // Math symbols
  { content: "+", x: "8%",   y: "28%", size: "2.8rem", color: "rgba(96,165,250,0.35)",  darkColor: "rgba(96,165,250,0.15)",  dur: 7,   delay: 0,   drift: -12, rotate: 8 },
  { content: "÷", x: "90%",  y: "70%", size: "2.6rem", color: "rgba(251,146,60,0.35)",  darkColor: "rgba(251,146,60,0.15)",  dur: 8,   delay: 1.5, drift: 14,  rotate: -6 },
  { content: "×", x: "75%",  y: "15%", size: "2.4rem", color: "rgba(250,204,21,0.4)",   darkColor: "rgba(250,204,21,0.15)",  dur: 6.5, delay: 0.8, drift: -10, rotate: 5 },
  { content: "−", x: "18%",  y: "85%", size: "2.5rem", color: "rgba(74,222,128,0.35)",  darkColor: "rgba(74,222,128,0.15)",  dur: 7.5, delay: 2,   drift: 11,  rotate: -8 },
  { content: "=", x: "55%",  y: "90%", size: "2.2rem", color: "rgba(192,132,252,0.3)",  darkColor: "rgba(192,132,252,0.12)", dur: 9,   delay: 3,   drift: -8,  rotate: 4 },
  // Numbers
  { content: "1", x: "25%",  y: "10%", size: "2.8rem", color: "rgba(248,113,113,0.3)",  darkColor: "rgba(248,113,113,0.12)", dur: 8,   delay: 0.5, drift: -11, rotate: 10 },
  { content: "2", x: "65%",  y: "82%", size: "2.6rem", color: "rgba(96,165,250,0.3)",   darkColor: "rgba(96,165,250,0.12)",  dur: 7,   delay: 1,   drift: 13,  rotate: -6 },
  { content: "3", x: "38%",  y: "92%", size: "2.4rem", color: "rgba(52,211,153,0.3)",   darkColor: "rgba(52,211,153,0.12)", dur: 9,   delay: 2.5, drift: -9,  rotate: 7 },
  { content: "7", x: "85%",  y: "40%", size: "2.5rem", color: "rgba(251,191,36,0.3)",   darkColor: "rgba(251,191,36,0.12)",  dur: 6.5, delay: 0.3, drift: 10,  rotate: -5 },
  { content: "9", x: "3%",   y: "58%", size: "2.2rem", color: "rgba(244,114,182,0.3)",  darkColor: "rgba(244,114,182,0.12)", dur: 8.5, delay: 1.8, drift: -14, rotate: 8 },
  // Letters
  { content: "A", x: "30%",  y: "5%",  size: "2.6rem", color: "rgba(129,140,248,0.3)",  darkColor: "rgba(129,140,248,0.12)", dur: 7.5, delay: 0.6, drift: -10, rotate: -7 },
  { content: "B", x: "95%",  y: "30%", size: "2.4rem", color: "rgba(251,146,60,0.3)",   darkColor: "rgba(251,146,60,0.12)",  dur: 8,   delay: 2,   drift: 12,  rotate: 6 },
  { content: "C", x: "10%",  y: "92%", size: "2.2rem", color: "rgba(45,212,191,0.3)",   darkColor: "rgba(45,212,191,0.12)",  dur: 6,   delay: 1.2, drift: -8,  rotate: -9 },
  // Stars / misc
  { content: "⭐", x: "45%", y: "3%",  size: "1.6rem", color: "", darkColor: "", dur: 5.5, delay: 0,   drift: -6,  rotate: 15 },
  { content: "✨", x: "60%", y: "6%",  size: "1.4rem", color: "", darkColor: "", dur: 4.5, delay: 0.8, drift: 5,   rotate: -12 },
  { content: "🎯", x: "20%", y: "35%", size: "1.8rem", color: "", darkColor: "", dur: 7,   delay: 2.5, drift: -9,  rotate: 6 },
  { content: "📐", x: "78%", y: "60%", size: "1.6rem", color: "", darkColor: "", dur: 8,   delay: 1,   drift: 7,   rotate: -8 },
];

/* ── Bubble configs ────────────────────────────────────────────── */
const BUBBLES: { x: string; y: string; w: number; bg: string; darkBg: string; dur: number; delay: number }[] = [
  { x: "-5%",  y: "-5%",  w: 280, bg: "rgba(147,197,253,0.25)", darkBg: "rgba(59,130,246,0.08)",  dur: 12, delay: 0 },
  { x: "85%",  y: "75%",  w: 320, bg: "rgba(253,186,116,0.2)",  darkBg: "rgba(249,115,22,0.07)",  dur: 14, delay: 2 },
  { x: "60%",  y: "-8%",  w: 200, bg: "rgba(196,181,253,0.2)",  darkBg: "rgba(139,92,246,0.06)",  dur: 10, delay: 1 },
  { x: "-3%",  y: "70%",  w: 240, bg: "rgba(110,231,183,0.2)",  darkBg: "rgba(16,185,129,0.06)",  dur: 11, delay: 3 },
  { x: "40%",  y: "85%",  w: 180, bg: "rgba(252,165,165,0.18)", darkBg: "rgba(239,68,68,0.05)",   dur: 13, delay: 1.5 },
  { x: "75%",  y: "20%",  w: 160, bg: "rgba(253,224,71,0.18)",  darkBg: "rgba(234,179,8,0.06)",   dur: 9,  delay: 0.5 },
];

export function AuthLayout({ children, className = "", contentClassName = "" }: AuthLayoutProps) {
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showAuthToggle = pathname === "/login" || pathname === "/register";

  const switchAuthPage = (to: string) => {
    if (to === pathname) return;
    const startViewTransition = (document as Document & {
      startViewTransition?: (callback: () => void) => void;
    }).startViewTransition;

    if (startViewTransition && !reduceMotion) {
      startViewTransition.call(document, () => {
        flushSync(() => navigate(to));
      });
    } else {
      navigate(to);
    }
  };

  return (
    <main className={`auth-page relative min-h-screen overflow-hidden bg-[#f4f8ff] text-slate-700 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200 ${className}`}>
      {/* ── Animated background layer ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Gradient blobs */}
        {BUBBLES.map((b, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.w,
              background: `var(--bubble-bg-${i})`,
            }}
          >
            <style>{`
              :root { --bubble-bg-${i}: ${b.bg}; }
              .dark { --bubble-bg-${i}: ${b.darkBg}; }
            `}</style>
          </div>
        ))}

        {/* Floating items: animals, numbers, letters, symbols */}
        {FLOAT_ITEMS.filter((_, index) => index % 2 === 0).map((item, i) => {
          const isEmoji = /\p{Emoji}/u.test(item.content);
          return (
            <motion.span
              key={`float-${i}`}
              animate={reduceMotion ? undefined : {
                y: [0, item.drift, 0],
                rotate: [0, item.rotate, 0],
              }}
              transition={{
                duration: item.dur,
                repeat: Infinity,
                delay: item.delay,
                ease: "easeInOut",
              }}
              className="absolute select-none font-black"
              style={{
                left: item.x,
                top: item.y,
                fontSize: item.size,
                color: isEmoji ? undefined : `var(--float-color-${i})`,
                opacity: isEmoji ? 0.55 : 1,
              }}
            >
              {!isEmoji && (
                <style>{`
                  :root { --float-color-${i}: ${item.color}; }
                  .dark { --float-color-${i}: ${item.darkColor}; }
                `}</style>
              )}
              {item.content}
            </motion.span>
          );
        })}
      </div>

      {/* ── Header ── */}
      <motion.header initial={reduceMotion ? false : { opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-4 sm:px-7">
        <Link to="/" className="group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20">
          <img src="/robot-head.png" alt="" className="h-11 w-11 object-contain drop-shadow-sm transition-transform group-hover:-rotate-6 group-hover:scale-105" />
          <span className="hidden text-lg font-black tracking-tight sm:inline sm:text-xl"><span className="text-blue-500">ViOlympic</span><span className="text-[#ff6f61]">Kids</span></span>
        </Link>

        {showAuthToggle && (
          <nav
            aria-label={lang === "vi" ? "Chuyển trang xác thực" : "Switch authentication page"}
            className="auth-toggle absolute left-1/2 flex -translate-x-1/2 items-center rounded-2xl border border-slate-200/90 bg-white/80 p-1 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80"
          >
            {[
              { to: "/login", vi: "Đăng nhập", en: "Log in" },
              { to: "/register", vi: "Đăng ký", en: "Sign up" },
            ].map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => switchAuthPage(item.to)}
                aria-current={pathname === item.to ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-xl px-3 py-2 text-xs font-extrabold outline-none transition-colors duration-300 sm:px-5 sm:text-sm ${pathname === item.to ? "text-white" : "text-slate-500 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-slate-300 dark:hover:text-blue-300"}`}
              >
                {pathname === item.to && (
                  <motion.span
                    layoutId="auth-toggle-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/20"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{lang === "vi" ? item.vi : item.en}</span>
              </button>
            ))}
          </nav>
        )}

        <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{lang === "vi" ? "Về trang chủ" : "Back to home"}</span>
        </Link>
      </motion.header>

      {/* ── Content ── */}
      <div className={`relative z-10 flex min-h-screen items-center justify-center px-4 pb-10 pt-24 sm:px-6 ${contentClassName}`}>
        {children}
      </div>
    </main>
  );
}
