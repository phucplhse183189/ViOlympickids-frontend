import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, CircleAlert, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { PARENT_PIN_KEY, DEFAULT_PARENT_PIN } from "@/features/auth/context/auth";
import { useLang } from "@/shared/lib/i18n";

interface ParentGateProps {
  onSuccess: () => void;
  onClose: () => void;
  onInteract?: () => void;
}

function getPin(): string {
  return localStorage.getItem(PARENT_PIN_KEY) || DEFAULT_PARENT_PIN;
}

export function ParentGate({ onSuccess, onClose, onInteract }: ParentGateProps) {
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [closing, setClosing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRefs.current[0]?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function closeModal() {
    if (closing || unlocked) return;
    setClosing(true);
    timerRef.current = window.setTimeout(onClose, reduceMotion ? 0 : 180);
  }

  function validatePin(pinDigits: string[]) {
    if (!pinDigits.every(Boolean) || unlocked) return;
    if (pinDigits.join("") === getPin()) {
      setUnlocked(true);
      setError(false);
      timerRef.current = window.setTimeout(onSuccess, reduceMotion ? 0 : 420);
      return;
    }

    setError(true);
    setAttempt((value) => value + 1);
    timerRef.current = window.setTimeout(() => {
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }, reduceMotion ? 0 : 450);
  }

  useEffect(() => {
    validatePin(digits);
  }, [digits]);

  function setDigitAt(index: number, digit: string) {
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setError(false);
    if (index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handleChange(index: number, value: string) {
    onInteract?.();
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      setDigits((current) => current.map((digit, position) => position === index ? "" : digit));
      setError(false);
      return;
    }
    if (sanitized.length === 1) {
      setDigitAt(index, sanitized);
      return;
    }
    fillDigits(index, sanitized);
  }

  function fillDigits(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) return;
    setDigits((current) => {
      const next = [...current];
      [...sanitized].slice(0, 4 - index).forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    setError(false);
    inputRefs.current[Math.min(index + sanitized.length, 3)]?.focus();
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!/\d/.test(pasted)) return;
    event.preventDefault();
    onInteract?.();
    fillDigits(index, pasted);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    onInteract?.();
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      setDigitAt(index, event.key);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      setDigits((current) => {
        const next = [...current];
        if (next[index]) next[index] = "";
        else if (index > 0) {
          next[index - 1] = "";
          inputRefs.current[index - 1]?.focus();
        }
        return next;
      });
      setError(false);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 3) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (event.key === "Escape") closeModal();
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: closing ? 0.16 : 0.22 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-md"
      onMouseDown={(event) => {
        onInteract?.();
        if (event.target === event.currentTarget) closeModal();
      }}
      role="presentation"
    >
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
        animate={closing ? { opacity: 0, y: 12, scale: 0.97 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-gate-title"
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(2,6,23,0.35)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-500/10" />
        <button onClick={closeModal} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:hover:bg-slate-800 dark:hover:text-white" aria-label={text("Đóng", "Close")}>
          <X size={19} />
        </button>

        <div className="relative px-6 pb-7 pt-8 sm:px-9 sm:pb-9">
          <motion.div animate={unlocked && !reduceMotion ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : undefined} className={`mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] ring-8 transition-colors duration-300 ${unlocked ? "bg-emerald-500 text-white ring-emerald-50 dark:ring-emerald-500/10" : "bg-blue-500 text-white ring-blue-50 dark:ring-blue-500/10"}`}>
            {unlocked ? <CheckCircle2 size={38} strokeWidth={2.3} /> : <ShieldCheck size={38} strokeWidth={2.2} />}
          </motion.div>

          <div className="mt-6 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-300">{text("Khu vực được bảo vệ", "Protected area")}</p>
            <h2 id="parent-gate-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{unlocked ? text("Đã mở khóa!", "Unlocked!") : text("Góc Phụ Huynh", "Parent Center")}</h2>
            <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">{unlocked ? text("Đang mở bảng điều khiển...", "Opening your dashboard...") : text("Nhập mã PIN gồm 4 chữ số để tiếp tục", "Enter your 4-digit PIN to continue")}</p>
          </div>

          <motion.div key={attempt} animate={error && !reduceMotion ? { x: [0, -8, 7, -5, 4, 0] } : undefined} transition={{ duration: 0.36 }} className="mt-7 flex justify-center gap-2.5 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element; }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={text(`Chữ số PIN ${index + 1}`, `PIN digit ${index + 1}`)}
                maxLength={1}
                disabled={unlocked || closing}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onPaste={(event) => handlePaste(index, event)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={`h-16 w-14 rounded-2xl border-2 text-center text-2xl font-black caret-transparent outline-none transition-all sm:h-[4.25rem] sm:w-16 ${error ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-4 focus:ring-rose-500/15 dark:bg-rose-500/10 dark:text-rose-300" : digit ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm focus:ring-4 focus:ring-blue-500/15 dark:bg-blue-500/15 dark:text-blue-200" : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:bg-slate-800"}`}
              />
            ))}
          </motion.div>

          <div className="mt-4 min-h-6" aria-live="polite">
            {error && <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-rose-500 dark:text-rose-300"><CircleAlert size={16} />{text("Mã PIN chưa đúng, vui lòng thử lại", "Incorrect PIN, please try again")}</p>}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
            <LockKeyhole size={14} />
            <span>{text("Mã PIN mặc định", "Default PIN")}: <strong className="font-mono text-slate-600 dark:text-slate-200">{DEFAULT_PARENT_PIN}</strong></span>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
