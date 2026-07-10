import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Star,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useGameSound } from "@/features/student/hooks/useGameSound";

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

/* ═══════════════════════════════════════════════════════════════════════════
   NUMBER GRID 10×10 (1–100)
   ═══════════════════════════════════════════════════════════════════════════ */

function NumberGrid({
  step,
  highlightNum,
  highlightTens,
  compareNums,
  sortNums,
}: {
  step: number;
  highlightNum: number | null;
  highlightTens: boolean;
  compareNums: [number, number] | null;
  sortNums: number[] | null;
}) {
  const rows = useMemo(() => {
    const r: number[][] = [];
    for (let row = 0; row < 10; row++) {
      const cols: number[] = [];
      for (let col = 1; col <= 10; col++) {
        cols.push(row * 10 + col);
      }
      r.push(cols);
    }
    return r;
  }, []);

  const tensSet = useMemo(() => new Set([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]), []);
  const compareSet = useMemo(() => (compareNums ? new Set(compareNums) : new Set<number>()), [compareNums]);
  const sortSet = useMemo(() => (sortNums ? new Set(sortNums) : new Set<number>()), [sortNums]);

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 shadow-2xl border-4 border-indigo-200/60">
      <div className="grid grid-cols-10 gap-[2px] sm:gap-1">
        {rows.flat().map((num) => {
          const isTensHL = highlightTens && tensSet.has(num);
          const isNumHL = highlightNum === num;
          const isCompareHL = compareSet.has(num);
          const isSortHL = sortSet.has(num);
          const isAnyHL = isTensHL || isNumHL || isCompareHL || isSortHL;

          // Place-value step: highlight tens digit cells for number 47
          const isPlaceValueTens = step === 2 && highlightNum === 47 && num >= 41 && num <= 44;
          const isPlaceValueOnes = step === 2 && highlightNum === 47 && (num === 7);

          return (
            <div
              key={num}
              className={twMerge(
                "flex items-center justify-center rounded sm:rounded-lg font-bold text-[8px] sm:text-xs md:text-sm transition-all duration-500 aspect-square",
                // Default style
                "bg-slate-50 text-slate-500 border border-slate-200/60",
                // Tens highlight (step 1)
                isTensHL && "bg-gradient-to-br from-amber-300 to-orange-400 text-white border-amber-400 scale-110 shadow-lg animate-theory-number-pop",
                // Single number highlight (step 2 — number 47)
                isNumHL && "bg-gradient-to-br from-indigo-400 to-purple-500 text-white border-indigo-300 scale-115 shadow-xl ring-2 ring-indigo-300/50 animate-theory-number-pop z-10",
                // Place value — tens blocks for 47 (cells 41-44 represent 4 tens)
                isPlaceValueTens && "bg-gradient-to-br from-rose-300 to-rose-400 text-white border-rose-400 scale-105 shadow-md",
                // Place value — ones block for 47 (cell 7 for visual reference)
                isPlaceValueOnes && "bg-gradient-to-br from-sky-300 to-sky-400 text-white border-sky-400 scale-105 shadow-md",
                // Compare highlight (step 3)
                isCompareHL && "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300 scale-115 shadow-xl ring-2 ring-emerald-300/50 animate-theory-number-pop z-10",
                // Sort highlight (step 4)
                isSortHL && "bg-gradient-to-br from-pink-400 to-rose-500 text-white border-pink-300 scale-110 shadow-lg animate-theory-number-pop z-10",
                // General highlighted bounce
                isAnyHL && "animate-theory-number-pop",
              )}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLACE VALUE VISUALIZATION (step 2)
   ═══════════════════════════════════════════════════════════════════════════ */

function PlaceValueBlocks() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 animate-kids-bounce-in">
      {/* Tens */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-rose-600 font-extrabold text-xs sm:text-sm">4 chục</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-5 h-12 sm:w-7 sm:h-16 bg-gradient-to-b from-rose-300 to-rose-500 rounded-lg border-2 border-rose-400 shadow-md animate-theory-number-pop"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className="text-rose-500 font-black text-lg sm:text-2xl">40</span>
      </div>
      {/* Plus sign */}
      <span className="text-2xl sm:text-3xl font-black text-slate-400">+</span>
      {/* Ones */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sky-600 font-extrabold text-xs sm:text-sm">7 đơn vị</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-3 h-5 sm:w-4 sm:h-7 bg-gradient-to-b from-sky-300 to-sky-500 rounded border-2 border-sky-400 shadow-sm animate-theory-number-pop"
              style={{ animationDelay: `${0.4 + i * 0.06}s` }}
            />
          ))}
        </div>
        <span className="text-sky-500 font-black text-lg sm:text-2xl">7</span>
      </div>
      {/* Equals */}
      <span className="text-2xl sm:text-3xl font-black text-slate-400">=</span>
      {/* Result */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-indigo-600 font-extrabold text-xs sm:text-sm">Kết quả</span>
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-black text-2xl sm:text-4xl px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-xl border-4 border-indigo-300 animate-theory-number-pop" style={{ animationDelay: "0.8s" }}>
          47
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPARISON VISUALIZATION (step 3)
   ═══════════════════════════════════════════════════════════════════════════ */

function CompareNumbers() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 animate-kids-bounce-in">
      <div className="flex flex-col items-center gap-1">
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 text-white font-black text-3xl sm:text-5xl px-5 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-xl border-4 border-sky-300 animate-theory-number-pop">
          35
        </div>
        <span className="text-sky-600 font-bold text-[10px] sm:text-xs">3 chục 5 đơn vị</span>
      </div>
      <div className="flex flex-col items-center gap-1 animate-theory-number-pop" style={{ animationDelay: "0.3s" }}>
        <div className="text-red-500 font-black text-4xl sm:text-6xl drop-shadow-lg">&lt;</div>
        <span className="text-red-400 font-extrabold text-[10px] sm:text-xs">bé hơn</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white font-black text-3xl sm:text-5xl px-5 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-xl border-4 border-emerald-300 animate-theory-number-pop" style={{ animationDelay: "0.15s" }}>
          53
        </div>
        <span className="text-emerald-600 font-bold text-[10px] sm:text-xs">5 chục 3 đơn vị</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORDERING VISUALIZATION (step 4)
   ═══════════════════════════════════════════════════════════════════════════ */

function OrderNumbers() {
  const nums = [72, 28, 45, 91, 13];
  const sorted = [13, 28, 45, 72, 91];
  const colors = [
    "from-pink-400 to-rose-500 border-pink-300",
    "from-orange-400 to-amber-500 border-orange-300",
    "from-lime-400 to-green-500 border-lime-300",
    "from-cyan-400 to-sky-500 border-cyan-300",
    "from-purple-400 to-indigo-500 border-purple-300",
  ];

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 animate-kids-bounce-in">
      {/* Before sorting */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-slate-500 font-bold text-[10px] sm:text-xs">Trước khi sắp xếp:</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {nums.map((n, i) => (
            <div
              key={`unsorted-${n}`}
              className={twMerge(
                "bg-gradient-to-b text-white font-black text-sm sm:text-xl px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-3 shadow-lg opacity-60",
                colors[i],
              )}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
      {/* Arrow */}
      <div className="text-2xl animate-theory-bounce-gentle">⬇️</div>
      {/* After sorting */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-emerald-600 font-bold text-[10px] sm:text-xs">Sắp xếp từ bé đến lớn:</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {sorted.map((n, i) => (
            <div
              key={`sorted-${n}`}
              className={twMerge(
                "bg-gradient-to-b text-white font-black text-sm sm:text-xl px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-3 shadow-lg animate-theory-number-pop",
                colors[nums.indexOf(n)],
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {n}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {sorted.map((n, i) => (
            <span key={n} className="flex items-center gap-1 text-slate-500 font-bold text-[10px] sm:text-xs">
              {n}{i < sorted.length - 1 && <span className="text-red-400 font-black">&lt;</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE — "Ôn tập các số đến 100"
   ═══════════════════════════════════════════════════════════════════════════ */

export function Math2B1TheoryPage() {
  const navigate = useNavigate();
  const sound = useGameSound();

  // Timeline:
  // 0: Chào hỏi
  // 1: Bảng số 1–100, đếm theo chục
  // 2: Phân tích hàng chục, hàng đơn vị (47)  ⭐ +1
  // 3: So sánh số 35 < 53                      ⭐ +1
  // 4: Sắp xếp các số                          ⭐ +1
  // 5: Hoàn thành — vào game
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const stepRef = useRef(0);
  const isPlayingRef = useRef(true);

  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const TOTAL_STEPS = 6;

  // Stars earned
  const starsEarned = step >= 4 ? 3 : step >= 3 ? 2 : step >= 2 ? 1 : 0;

  // Confetti on milestone steps
  useEffect(() => {
    if (step === 2 || step === 3 || step === 4) {
      setShowConfetti(true);
      sound.correct();
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const getTextForStep = useCallback((s: number) => {
    switch (s) {
      case 0: return "Chào các bạn nhỏ! Hôm nay Tí Tách sẽ cùng các bạn ôn tập các số đến 100 nhé!";
      case 1: return "Đây là bảng số từ 1 đến 100! Chúng mình đếm theo chục nhé: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100!";
      case 2: return "Mỗi số có hai hàng: hàng chục và hàng đơn vị. Ví dụ số 47 gồm 4 chục và 7 đơn vị!";
      case 3: return "So sánh hai số: 35 và 53. Số 35 có 3 chục, số 53 có 5 chục. Vì 3 chục bé hơn 5 chục nên 35 bé hơn 53!";
      case 4: return "Sắp xếp các số từ bé đến lớn: 13, 28, 45, 72, 91. So hàng chục trước, rồi đến hàng đơn vị nhé!";
      case 5: return "Tuyệt vời! Các bạn đã ôn tập xong rồi! Giờ vào chơi Game thôi nào!";
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
      const pause = 1200;
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

  // ── Grid highlight logic per step ─────────────────────────────────────
  const highlightTens = step === 1;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="h-full flex flex-col font-sans select-none relative overflow-hidden">
      {/* ── Scene Background (fixed, behind everything) ───── */}
      <div className="fixed inset-0 -z-30" style={{ background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 35%, #d1fae5 70%, #86efac 100%)" }} />
      <div className="fixed top-[4%] right-[8%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-yellow-300 shadow-[0_0_50px_15px_rgba(253,224,71,0.4)] -z-20 pointer-events-none animate-pulse-slow" />
      <div className="fixed top-[5%] left-[5%] text-5xl sm:text-7xl opacity-20 pointer-events-none animate-theory-cloud -z-20 select-none">☁️</div>
      <div className="fixed top-[8%] right-[12%] text-4xl sm:text-6xl opacity-15 pointer-events-none animate-theory-cloud -z-20 select-none" style={{ animationDelay: "3s" }}>☁️</div>
      {/* Green hills */}
      <div className="fixed bottom-0 left-0 right-0 h-[25%] pointer-events-none" style={{ background: "linear-gradient(180deg, #86efac 0%, #22c55e 50%, #16a34a 100%)", borderRadius: "60% 60% 0 0 / 30% 30% 0 0", zIndex: -15 }} />
      <div className="fixed bottom-0 left-[-5%] right-[-5%] h-[18%] pointer-events-none opacity-80" style={{ background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)", borderRadius: "50% 50% 0 0 / 40% 40% 0 0", zIndex: -14 }} />
      {/* Flowers */}
      {[15, 40, 65, 85].map((x, i) => (
        <div key={i} className="fixed pointer-events-none animate-theory-bounce-gentle select-none" style={{ bottom: `${10 + Math.sin(i) * 3}%`, left: `${x}%`, animationDelay: `${i * 0.4}s`, zIndex: -5 }}>
          <span className="text-lg sm:text-xl drop-shadow-md">{["🌷", "🌻", "🌼", "🌸"][i]}</span>
        </div>
      ))}
      {/* Sparkles */}
      {[20, 50, 75].map((x, i) => (
        <div key={i} className="fixed pointer-events-none animate-theory-sparkle select-none" style={{ top: `${25 + i * 10}%`, left: `${x}%`, animationDelay: `${i * 0.7}s`, zIndex: -10 }}>
          <span className="text-base">✨</span>
        </div>
      ))}
      {/* Chalkboard / classroom accents */}
      <div className="fixed top-[15%] left-[2%] text-3xl sm:text-4xl opacity-15 pointer-events-none -z-20 select-none animate-theory-bounce-gentle" style={{ animationDelay: "1s" }}>📐</div>
      <div className="fixed top-[20%] right-[3%] text-3xl sm:text-4xl opacity-15 pointer-events-none -z-20 select-none animate-theory-bounce-gentle" style={{ animationDelay: "2s" }}>📏</div>

      <ConfettiBurst active={showConfetti} />

      {/* ── Top Nav ─────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg flex items-center justify-between z-40 border-b-3 border-emerald-300/50 shrink-0">
        <button onClick={() => navigate("/student")} className="flex items-center gap-1.5 text-emerald-700 font-extrabold hover:text-emerald-900 transition-colors text-xs sm:text-sm">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">📚</span>
          <span className="font-black text-emerald-700 text-[11px] sm:text-xs hidden md:inline">Ôn tập các số đến 100</span>
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
      <div className="flex-1 flex flex-col items-center justify-start gap-3 sm:gap-5 md:gap-6 relative z-20 w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-5 overflow-y-auto min-h-0">

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

        {/* ② Interactive Content Area ────────────────────── */}

        {/* Step 1: Number grid with tens highlighted */}
        {step === 1 && (
          <div className="w-full max-w-md sm:max-w-lg animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <NumberGrid
              step={step}
              highlightNum={null}
              highlightTens={highlightTens}
              compareNums={null}
              sortNums={null}
            />
            <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3 flex-wrap">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => (
                <span key={n} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm animate-theory-number-pop" style={{ animationDelay: `${(n / 10) * 0.08}s` }}>
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Number grid + Place value blocks */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="w-full max-w-md sm:max-w-lg">
              <NumberGrid
                step={step}
                highlightNum={47}
                highlightTens={false}
                compareNums={null}
                sortNums={null}
              />
            </div>
            <PlaceValueBlocks />
            <div className="bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-xl border-[3px] border-indigo-200 animate-kids-bounce-in max-w-sm">
              <div className="text-center">
                <div className="text-indigo-600 font-extrabold text-xs sm:text-sm">📖 Phân tích số 47</div>
                <div className="mt-1 bg-indigo-50 rounded-xl px-3 py-1.5 text-indigo-700 font-black text-sm sm:text-lg">
                  47 = <span className="text-rose-500">4</span> chục <span className="text-sky-500">7</span> đơn vị
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Comparison visualization */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="w-full max-w-md sm:max-w-lg">
              <NumberGrid
                step={step}
                highlightNum={null}
                highlightTens={false}
                compareNums={[35, 53]}
                sortNums={null}
              />
            </div>
            <CompareNumbers />
            <div className="bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-xl border-[3px] border-emerald-200 animate-kids-bounce-in max-w-sm">
              <div className="text-center">
                <div className="text-emerald-600 font-extrabold text-xs sm:text-sm">🔍 So sánh hai số</div>
                <div className="mt-1 bg-emerald-50 rounded-xl px-3 py-1.5 text-emerald-700 font-black text-sm sm:text-lg">
                  So hàng chục: <span className="text-sky-500">3</span> chục &lt; <span className="text-emerald-500">5</span> chục → <span className="text-red-500">35 &lt; 53</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Ordering visualization */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="w-full max-w-md sm:max-w-lg">
              <NumberGrid
                step={step}
                highlightNum={null}
                highlightTens={false}
                compareNums={null}
                sortNums={[13, 28, 45, 72, 91]}
              />
            </div>
            <OrderNumbers />
          </div>
        )}

        {/* Step 0: Just the greeting — show a preview grid faded */}
        {step === 0 && (
          <div className="w-full max-w-md sm:max-w-lg opacity-50 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <NumberGrid
              step={step}
              highlightNum={null}
              highlightTens={false}
              compareNums={null}
              sortNums={null}
            />
          </div>
        )}

        {/* ③ Progress pills ────────────────────────────────── */}
        {step < TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 animate-fade-in-up">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={twMerge(
                  "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-500 border-2",
                  i === step
                    ? "bg-indigo-500 border-indigo-300 scale-125 shadow-lg"
                    : i < step
                      ? "bg-emerald-400 border-emerald-300 shadow-sm"
                      : "bg-white/60 border-white/40"
                )}
              />
            ))}
          </div>
        )}

        {/* ④ CTA Button — hiển thị giữa màn hình khi hoàn thành ── */}
        {step >= TOTAL_STEPS - 1 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-kids-bounce-in">
            <div className="flex items-center gap-2 sm:gap-3">
              {[0, 1, 2].map((i) => (
                <Star key={i} size={32} fill={i < starsEarned ? "#facc15" : "none"} stroke={i < starsEarned ? "#f59e0b" : "#d1d5db"} className="drop-shadow-lg animate-kids-bounce-in" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <button
              onClick={() => navigate("/student/game/math2-b1")}
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
