import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Star,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useGameSound } from "@/shared/lib/useGameSound";

/* ═══════════════════════════════════════════════════════════════════════════
   SMALL HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Confetti burst (appears on knowledge milestones) ────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"][i % 7],
        delay: Math.random() * 0.4,
        size: 6 + Math.random() * 6,
        rot: Math.random() * 720,
      })),
    [],
  );
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-5%",
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            animation: `confetti-drop 2.2s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Star counter (top-right, gamification) ──────────────────────────────
function StarCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 bg-amber-400/90 text-white font-black text-sm px-3 py-1.5 rounded-full shadow-lg border-2 border-amber-300">
      <Star size={16} fill="currentColor" className="drop-shadow-sm" />
      <span>{count}</span>
    </div>
  );
}

// ── Speaking wave bars ──────────────────────────────────────────────────
function SpeakingWave() {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-white/70 rounded-full animate-theory-speaking-wave"
          style={{ height: `${10 + Math.random() * 6}px`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}

/** Nút cuộn trục số — bo tròn, bóng 3D, khớp phong cách “đá số” (thay ô vuông xanh phẳng). */
function TheoryAxisNavButton({
  dir,
  onClick,
  visible,
}: {
  dir: "left" | "right";
  onClick: () => void;
  visible: boolean;
}) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Xem các số bên trái" : "Xem các số bên phải"}
      onClick={onClick}
      className={twMerge(
        "flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full",
        "border-[3px] border-white bg-gradient-to-b from-white via-sky-50 to-sky-200",
        "text-sky-600 shadow-[0_4px_0_#0284c9,0_10px_20px_rgba(14,165,233,0.28)]",
        "transition-all duration-200 hover:scale-110 hover:brightness-[1.03]",
        "active:translate-y-0.5 active:shadow-[0_2px_0_#0284c9] active:brightness-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-100/80",
        !visible && "pointer-events-none scale-90 opacity-0",
      )}
    >
      <Icon className="h-[1.15rem] w-[1.15rem] sm:h-6 sm:w-6" strokeWidth={2.75} />
    </button>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE — "Cuộc phiêu lưu trên trục số"
   ═══════════════════════════════════════════════════════════════════════════ */

export function Math2B2TheoryPage() {
  const navigate = useNavigate();
  const sound = useGameSound();

  // Timeline:
  // 0: Chào hỏi
  // 1: Robot xuất hiện ở số 15
  // 2: Nhảy lùi → 14 (Số liền trước)     ⭐ +1
  // 3: Quay lại 15
  // 4: Nhảy tới → 16 (Số liền sau)        ⭐ +1
  // 5: Hoàn thành – vào game               ⭐ +1
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(true);
  const lineScrollRef = useRef<HTMLDivElement>(null);
  const stoneRowRef = useRef<HTMLDivElement>(null);
  const [lineCanScrollLeft, setLineCanScrollLeft] = useState(false);
  const [lineCanScrollRight, setLineCanScrollRight] = useState(false);
  /** Tâm ô số (px từ mép trái hàng ô) — tránh lệch do % trên cả khối có nút cuộn hai bên */
  const [robotCenterX, setRobotCenterX] = useState<number | null>(null);

  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const TOTAL_STEPS = 6;

  // Stars earned
  const starsEarned = step >= 5 ? 3 : step >= 4 ? 2 : step >= 2 ? 1 : 0;

  // Confetti on milestone steps
  useEffect(() => {
    if (step === 2 || step === 4 || step === 5) {
      setShowConfetti(true);
      sound.correct();
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const getTextForStep = useCallback((s: number) => {
    switch (s) {
      case 0: return "Chào các bạn nhỏ! Hôm nay Tí Tách sẽ dẫn các bạn đi phiêu lưu trên trục số nhé!";
      case 1: return "Nhìn kìa! Tí Tách đang đứng ở ô số 15.";
      case 2: return "Tí Tách nhảy lùi 1 bước! 15 trừ 1 bằng 14. Vậy Số Liền Trước của 15 là 14!";
      case 3: return "Tí Tách quay lại mốc 15 nào!";
      case 4: return "Bây giờ Tí Tách nhảy tới 1 bước! 15 cộng 1 bằng 16. Vậy Số Liền Sau của 15 là 16!";
      case 5: return "Tuyệt vời! Các bạn đã học xong rồi! Sẵn sàng vào chơi Game chưa nào?";
      default: return "";
    }
  }, []);

  // ── Voice-synced auto progression ─────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || step >= TOTAL_STEPS) return;

    let hasAdvanced = false;
    let cancelled = false;
    let advanceTimerId: ReturnType<typeof setTimeout> | null = null;

    const text = getTextForStep(step);
    setDisplayedText(text);
    setIsSpeaking(true);

    const advanceToNext = () => {
      if (hasAdvanced || cancelled) return;
      hasAdvanced = true;
      setIsSpeaking(false);
      if (!isPlayingRef.current) return;
      if (stepRef.current >= TOTAL_STEPS - 1) return;
      const pause = stepRef.current === 3 ? 600 : 1200;
      advanceTimerId = setTimeout(() => {
        if (!cancelled && isPlayingRef.current) setStep((s) => s + 1);
      }, pause);
    };

    const speakTimer = setTimeout(() => {
      if (cancelled) return;
      sound.speak(text, advanceToNext);
    }, 400);

    const estimated = Math.min(Math.max(text.length * 100, 4000), 12000);
    const safetyTimer = setTimeout(advanceToNext, estimated + 800);

    return () => {
      cancelled = true;
      clearTimeout(speakTimer);
      clearTimeout(safetyTimer);
      if (advanceTimerId) clearTimeout(advanceTimerId);
      sound.stopVoice();
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) { window.speechSynthesis?.cancel(); sound.stopVoice(); setIsSpeaking(false); }
    setIsPlaying(!isPlaying);
  };
  const handleSkip = () => {
    window.speechSynthesis?.cancel(); sound.stopVoice(); setIsSpeaking(false);
    setStep(TOTAL_STEPS - 1); setDisplayedText(getTextForStep(TOTAL_STEPS - 1)); setIsPlaying(false);
  };

  // ── Number line data ──────────────────────────────────────────────────
  const numbers = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const focusNumForRobot =
    step === 0 ? null : step === 2 ? 14 : step === 4 || step === 5 ? 16 : 15;
  const isHopping = step === 2 || step === 4;

  const syncRobotToStone = useCallback(() => {
    const row = stoneRowRef.current;
    if (!row || focusNumForRobot === null) {
      setRobotCenterX(null);
      return;
    }
    const tile = row.querySelector(
      `[data-theory-num="${focusNumForRobot}"]`,
    );
    if (!tile || !(tile instanceof HTMLElement)) {
      setRobotCenterX(null);
      return;
    }
    setRobotCenterX(tile.offsetLeft + tile.offsetWidth / 2);
  }, [focusNumForRobot]);

  const updateLineScrollArrows = useCallback(() => {
    const el = lineScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 2) {
      setLineCanScrollLeft(false);
      setLineCanScrollRight(false);
      return;
    }
    setLineCanScrollLeft(scrollLeft > 6);
    setLineCanScrollRight(scrollLeft < maxScroll - 6);
  }, []);

  const scrollNumberLine = useCallback((dir: "left" | "right") => {
    const el = lineScrollRef.current;
    if (!el) return;
    const delta = Math.min(160, Math.max(96, el.clientWidth * 0.55));
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = lineScrollRef.current;
    if (!el) return;
    const run = () => updateLineScrollArrows();
    run();
    const raf = requestAnimationFrame(run);
    el.addEventListener("scroll", run, { passive: true });
    const ro = new ResizeObserver(run);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner instanceof HTMLElement) ro.observe(inner);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", run);
      ro.disconnect();
    };
  }, [updateLineScrollArrows, step]);

  useLayoutEffect(() => {
    syncRobotToStone();
  }, [syncRobotToStone, step]);

  useEffect(() => {
    const row = stoneRowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => syncRobotToStone());
    ro.observe(row);
    return () => ro.disconnect();
  }, [syncRobotToStone]);

  // Giữ ô đang nhấn mạnh (14 / 15 / 16) gần giữa khi cuộn được
  useEffect(() => {
    if (step >= TOTAL_STEPS - 1) return;
    const root = lineScrollRef.current;
    if (!root) return;
    const focusNum =
      step >= 4 ? 16 : step >= 2 ? 14 : step >= 1 ? 15 : null;
    if (focusNum === null) return;
    const node = root.querySelector(`[data-theory-num="${focusNum}"]`);
    if (node instanceof HTMLElement) {
      node.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [step]);

  // Stepping stone colors (bright, varied)
  const stoneColors = [
    "from-pink-400 to-pink-500 border-pink-500",
    "from-rose-400 to-rose-500 border-rose-500",
    "from-orange-400 to-orange-500 border-orange-500",
    "from-amber-400 to-amber-500 border-amber-500",
    "from-yellow-400 to-yellow-500 border-yellow-500",
    "from-lime-400 to-lime-500 border-lime-500",
    "from-emerald-400 to-emerald-500 border-emerald-500",
    "from-teal-400 to-teal-500 border-teal-500",
    "from-cyan-400 to-cyan-500 border-cyan-500",
    "from-sky-400 to-sky-500 border-sky-500",
    "from-blue-400 to-blue-500 border-blue-500",
  ];

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="h-full flex flex-col font-sans select-none relative overflow-hidden">
      {/* ── Scene Background (fixed, behind everything) ───── */}
      <div className="fixed inset-0 -z-30" style={{ background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 35%, #d1fae5 70%, #86efac 100%)" }} />
      <div className="fixed top-[4%] right-[8%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-yellow-300 shadow-[0_0_50px_15px_rgba(253,224,71,0.4)] -z-20 pointer-events-none animate-pulse-slow" />
      <div className="fixed top-[5%] left-[5%] text-5xl sm:text-7xl opacity-20 pointer-events-none animate-theory-cloud -z-20 select-none">☁️</div>
      <div className="fixed top-[8%] right-[12%] text-4xl sm:text-6xl opacity-15 pointer-events-none animate-theory-cloud -z-20 select-none" style={{ animationDelay: "3s" }}>☁️</div>
      <div className="fixed bottom-0 left-0 right-0 h-[25%] pointer-events-none" style={{ background: "linear-gradient(180deg, #86efac 0%, #22c55e 50%, #16a34a 100%)", borderRadius: "60% 60% 0 0 / 30% 30% 0 0", zIndex: -15 }} />
      <div className="fixed bottom-0 left-[-5%] right-[-5%] h-[18%] pointer-events-none opacity-80" style={{ background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)", borderRadius: "50% 50% 0 0 / 40% 40% 0 0", zIndex: -14 }} />
      {[15, 40, 65, 85].map((x, i) => (
        <div key={i} className="fixed pointer-events-none animate-theory-bounce-gentle select-none" style={{ bottom: `${10 + Math.sin(i) * 3}%`, left: `${x}%`, animationDelay: `${i * 0.4}s`, zIndex: -5 }}>
          <span className="text-lg sm:text-xl drop-shadow-md">{["🌷", "🌻", "🌼", "🌸"][i]}</span>
        </div>
      ))}
      {[20, 50, 75].map((x, i) => (
        <div key={i} className="fixed pointer-events-none animate-theory-sparkle select-none" style={{ top: `${25 + i * 10}%`, left: `${x}%`, animationDelay: `${i * 0.7}s`, zIndex: -10 }}>
          <span className="text-base">✨</span>
        </div>
      ))}

      <ConfettiBurst active={showConfetti} />

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg flex items-center justify-between z-40 border-b-3 border-emerald-300/50 shrink-0">
        <button onClick={() => navigate("/student")} className="flex items-center gap-1.5 text-emerald-700 font-extrabold hover:text-emerald-900 transition-colors text-xs sm:text-sm">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">🗺️</span>
          <span className="font-black text-emerald-700 text-[11px] sm:text-xs hidden md:inline">Phiêu lưu trên Trục Số</span>
          <StarCounter count={starsEarned} />
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleTogglePlay}
            className={twMerge("flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 font-bold rounded-full transition-all text-[11px] sm:text-xs",
              isPlaying ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-2 border-amber-300" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300"
            )}>
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span className="hidden sm:inline">{isPlaying ? "Dừng" : "Tiếp"}</span>
          </button>
          <button onClick={handleSkip} className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all border-2 border-slate-200 text-[11px] sm:text-xs">
            <SkipForward size={12} /> <span className="hidden sm:inline">Bỏ qua</span>
          </button>
        </div>
      </div>

      {/* ── Scene Content — each section is a separate flex child ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto min-h-0">

        {/* ① Robot + Speech Bubble ────────────────────────── */}
        <div className="w-full max-w-4xl animate-fade-in-up">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className={twMerge(
                "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300",
                isSpeaking ? "animate-theory-rainbow-border border-indigo-400 scale-105" : "border-white/90"
              )}>
                <video src="/videos/VideoRobotHoatDong.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" />
              </div>
              {isSpeaking && (
                <div className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white p-1 rounded-full shadow-lg animate-bounce">
                  <Volume2 size={12} />
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                Tí Tách 🤖
              </div>
            </div>
            <div className="relative flex-1">
              <div className={twMerge(
                "relative p-4 sm:p-5 rounded-2xl shadow-xl border-4 transition-all duration-300",
                isSpeaking ? "bg-white border-indigo-200" : "bg-white/95 border-slate-200/60"
              )}>
                <div className="absolute -left-3 top-6 w-4 h-4 bg-white rotate-45 border-l-4 border-b-4 border-indigo-200" />
                <p className="text-sm sm:text-lg md:text-xl font-black text-slate-700 leading-snug">
                  {displayedText}
                </p>
                {isSpeaking && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <SpeakingWave />
                    <span className="text-[10px] sm:text-xs text-indigo-400 font-bold">Đang nói...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ② Number Line (ẩn khi hoàn thành) ────────────── */}
        {step < TOTAL_STEPS - 1 && (
        <div className="w-full relative pt-12 sm:pt-14 pb-1 px-2 sm:px-4 md:px-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div
            className="pointer-events-none absolute top-1/2 left-12 right-12 sm:left-14 sm:right-14 md:left-16 md:right-16 h-3 sm:h-4 rounded-full -translate-y-1/2 z-0"
            style={{ background: "linear-gradient(90deg, #f9a8d4, #fbbf24, #34d399, #38bdf8, #818cf8)" }}
          />
          <div className="relative z-10 flex w-full items-center gap-1.5 sm:gap-2">
            <TheoryAxisNavButton
              dir="left"
              onClick={() => scrollNumberLine("left")}
              visible={lineCanScrollLeft}
            />
            <div
              ref={lineScrollRef}
              className="min-w-0 flex-1 overflow-x-auto overflow-y-visible scroll-smooth overscroll-x-contain py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* pt-* tạo chỗ cho robot trong cùng hộp cuộn — tránh bottom-full (nằm ngoài khối) bị overflow-x-auto cắt mất */}
              <div className="relative mx-auto w-max px-0.5 pt-12 sm:pt-14 md:pt-16">
                {/* Lớp ngoài: chỉ căn ngang (translateX) — không dùng animation transform ở đây để khỏi trùng keyframes theory-hop */}
                <div
                  className="pointer-events-none absolute top-0 z-20 flex justify-center"
                  style={{
                    left: robotCenterX ?? 0,
                    transform: "translateX(-50%)",
                    transition:
                      "left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease, scale 0.4s ease",
                  }}
                >
                  <div
                    className={twMerge(
                      "flex w-10 flex-col items-center justify-end transform-gpu sm:w-14 md:w-16",
                      isHopping ? "animate-theory-hop" : "animate-theory-bounce-gentle",
                      step === 0 ? "opacity-0 scale-50" : "opacity-100 scale-100",
                    )}
                  >
                    <div className="relative flex h-10 w-full justify-center sm:h-14 md:h-16">
                      {isHopping && (
                        <div
                          className="absolute left-1/2 z-30 flex -translate-x-1/2 animate-bounce items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-white/95 px-2.5 py-1 shadow-[0_-4px_0_rgba(14,165,233,0.28)] backdrop-blur-sm drop-shadow-md"
                          style={{ bottom: "calc(100% + 6px)" }}
                        >
                          {step === 2 ? (
                            <ChevronLeft className="h-4 w-4 text-rose-500" strokeWidth={3} />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                          )}
                          <span className="text-[9px] font-black uppercase tracking-wide text-slate-600 sm:text-[10px]">
                            {step === 2 ? "Lùi 1 bước" : "Tới 1 bước"}
                          </span>
                        </div>
                      )}
                      <img
                        src="/robot-head.png"
                        alt="Tí Tách"
                        className="h-full w-full object-contain drop-shadow-xl"
                      />
                    </div>
                  </div>
                </div>
                <div
                  ref={stoneRowRef}
                  className="flex w-max flex-nowrap items-stretch gap-1.5 sm:gap-2 md:gap-3"
                >
            {numbers.map((num, idx) => {
              const isPre = step >= 2 && num === 14;
              const isSuc = step >= 4 && num === 16;
              const isCtr = num === 15;
              const isHL = isPre || isSuc || isCtr;
              return (
                <div
                  key={num}
                  data-theory-num={num}
                  className="relative flex shrink-0 flex-col items-center"
                >
                  <div className={twMerge(
                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-white shadow-sm transition-all duration-500 mb-1",
                    isCtr ? "bg-amber-400 scale-150" : "bg-white/70",
                    isPre ? "bg-rose-400 scale-150" : "",
                    isSuc ? "bg-emerald-400 scale-150" : ""
                  )} />
                  <div className={twMerge(
                    "transition-all duration-500 rounded-xl sm:rounded-2xl border-[3px] sm:border-4 shadow-lg font-black text-white text-center cursor-default",
                    "w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 flex items-center justify-center text-xs sm:text-lg md:text-2xl",
                    `bg-gradient-to-b ${stoneColors[idx]}`,
                    isHL ? "-translate-y-2 sm:-translate-y-3 scale-115 sm:scale-125" : "hover:scale-105",
                    isPre ? "!from-rose-400 !to-rose-600 !border-rose-300 ring-2 sm:ring-4 ring-rose-200/70 shadow-xl" : "",
                    isCtr ? "!from-amber-400 !to-amber-600 !border-amber-300 ring-2 sm:ring-4 ring-amber-200/70 shadow-xl" : "",
                    isSuc ? "!from-emerald-400 !to-emerald-600 !border-emerald-300 ring-2 sm:ring-4 ring-emerald-200/70 shadow-xl" : "",
                    isHL ? "animate-theory-number-pop" : ""
                  )} style={isHL ? { animationDelay: "0.1s" } : {}}>
                    {num}
                  </div>
                </div>
              );
            })}
                </div>
              </div>
            </div>
            <TheoryAxisNavButton
              dir="right"
              onClick={() => scrollNumberLine("right")}
              visible={lineCanScrollRight}
            />
          </div>
        </div>
        )}

        {/* ③ Legend pills (ẩn khi hoàn thành) ────────────── */}
        {step >= 1 && step < TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap animate-fade-in-up">
            {step >= 2 && (
              <span className="bg-rose-500 text-white font-bold text-[10px] sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md inline-flex items-center gap-1 animate-kids-bounce-in">
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-95" strokeWidth={2.75} />
                14 Liền trước
              </span>
            )}
            <span className="bg-amber-500 text-white font-bold text-[10px] sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md inline-flex items-center gap-1">
              📍 15 Đang đứng
            </span>
            {step >= 4 && (
              <span className="bg-emerald-500 text-white font-bold text-[10px] sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md inline-flex items-center gap-1 animate-kids-bounce-in">
                16 Liền sau
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-95" strokeWidth={2.75} />
              </span>
            )}
          </div>
        )}

        {/* ④ Discovery Cards (ẩn khi hoàn thành) ──────────── */}
        {step >= 2 && step < TOTAL_STEPS - 1 && (
          <div className="flex items-stretch justify-center gap-3 sm:gap-5 w-full max-w-xl animate-fade-in-up">
            <div className="flex-1 bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-xl border-[3px] border-rose-200 animate-kids-bounce-in">
              <div className="text-center">
                <div className="text-rose-600 font-extrabold text-xs sm:text-sm">⬅ Số Liền Trước</div>
                <div className="text-slate-500 font-bold text-[10px] sm:text-xs">Lấy số đó <span className="text-rose-500 font-black">trừ 1</span></div>
                <div className="mt-1 bg-rose-50 rounded-xl px-3 py-1.5 text-rose-700 font-black text-sm sm:text-lg">
                  15 − 1 = <span className="text-xl sm:text-2xl text-rose-500">14</span>
                </div>
              </div>
            </div>
            {step >= 4 && (
              <div className="flex-1 bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-xl border-[3px] border-emerald-200 animate-kids-bounce-in">
                <div className="text-center">
                  <div className="text-emerald-600 font-extrabold text-xs sm:text-sm">Số Liền Sau ➡</div>
                  <div className="text-slate-500 font-bold text-[10px] sm:text-xs">Lấy số đó <span className="text-emerald-500 font-black">cộng 1</span></div>
                  <div className="mt-1 bg-emerald-50 rounded-xl px-3 py-1.5 text-emerald-700 font-black text-sm sm:text-lg">
                    15 + 1 = <span className="text-xl sm:text-2xl text-emerald-500">16</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ⑤ CTA Button — hiển thị giữa màn hình khi hoàn thành ── */}
        {step >= TOTAL_STEPS - 1 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-kids-bounce-in">
            <div className="flex items-center gap-2 sm:gap-3">
              {[0, 1, 2].map((i) => (
                <Star key={i} size={32} fill={i < starsEarned ? "#facc15" : "none"} stroke={i < starsEarned ? "#f59e0b" : "#d1d5db"} className="drop-shadow-lg animate-kids-bounce-in" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <button
              onClick={() => navigate("/student/game/number-sequence")}
              className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-lg sm:text-2xl md:text-3xl px-10 sm:px-14 py-4 sm:py-5 rounded-full shadow-[0_6px_0_#4338ca] sm:shadow-[0_8px_0_#4338ca] active:translate-y-1 active:shadow-[0_2px_0_#4338ca] hover:-translate-y-1 hover:shadow-[0_10px_0_#4338ca] transition-all"
            >
              <span className="flex items-center gap-2 sm:gap-3">
                🎮 Vào chơi Game!
                <span className="text-2xl sm:text-3xl group-hover:animate-bounce">🚀</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
