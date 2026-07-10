import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Sparkles,
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  Heart,
  Target,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useGameSound } from "@/features/student/hooks/useGameSound";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

type GameMode = "choice" | "drag" | "input";
type TaskKind = "prev" | "next";

interface Task {
  anchor: number;
  kind: TaskKind;
  answer: number;
  distractors: number[];
}

interface LevelDef {
  id: number;
  title: string;
  subtitle: string;
  mode: GameMode;
  taskCount: number;
  timeLimit: number;
  rangeMin: number;
  rangeMax: number;
  emoji: string;
}

const LEVELS: LevelDef[] = [
  { id: 1, title: "Vườn Hoa Kỳ Diệu", subtitle: "Chọn số liền trước", mode: "choice", taskCount: 5, timeLimit: 60, rangeMin: 1, rangeMax: 10, emoji: "🌸" },
  { id: 2, title: "Cầu Vồng Sắc Màu", subtitle: "Chọn số liền sau", mode: "choice", taskCount: 5, timeLimit: 55, rangeMin: 1, rangeMax: 10, emoji: "🌈" },
  { id: 3, title: "Tàu Lửa Vui Nhộn", subtitle: "Kéo thả số liền trước", mode: "drag", taskCount: 5, timeLimit: 50, rangeMin: 10, rangeMax: 50, emoji: "🚂" },
  { id: 4, title: "Lâu Đài Trên Mây", subtitle: "Kéo thả số liền sau", mode: "drag", taskCount: 5, timeLimit: 50, rangeMin: 10, rangeMax: 50, emoji: "🏰" },
  { id: 5, title: "Vũ Trụ Bí Ẩn", subtitle: "Điền số liền trước & sau", mode: "input", taskCount: 6, timeLimit: 60, rangeMin: 50, rangeMax: 100, emoji: "🚀" },
];

const TOTAL_LEVELS = LEVELS.length;

const ENCOURAGEMENTS = [
  "Giỏi lắm! 🌟",
  "Tuyệt vời! ⭐",
  "Xuất sắc! 🎉",
  "Chính xác! ✅",
  "Đúng rồi! 🎯",
  "Thật tài giỏi! 💪",
  "Cừ lắm! 🏆",
];

const WRONG_ENCOURAGEMENTS = [
  "Thử lại nhé! 💪",
  "Cố gắng lên! 🌈",
  "Gần đúng rồi! ⭐",
  "Mình đúng được mà! 🌟",
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTasks(level: LevelDef): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < level.taskCount; i++) {
    let kind: TaskKind;
    if (level.id === 1) kind = "prev";
    else if (level.id === 2) kind = "next";
    else kind = Math.random() < 0.5 ? "prev" : "next";

    const anchor = kind === "prev"
      ? randomInt(level.rangeMin + 1, level.rangeMax)
      : randomInt(level.rangeMin, level.rangeMax - 1);
    const answer = kind === "prev" ? anchor - 1 : anchor + 1;

    const distractorSet = new Set<number>();
    distractorSet.add(answer);
    while (distractorSet.size < 4) {
      const d = randomInt(Math.max(0, anchor - 3), anchor + 3);
      if (d !== answer && d >= 0) distractorSet.add(d);
    }
    distractorSet.delete(answer);
    const distractors = shuffle([...distractorSet].slice(0, 3));

    tasks.push({ anchor, kind, answer, distractors });
  }
  return tasks;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6"][i % 7],
        delay: Math.random() * 0.6,
        size: 6 + Math.random() * 8,
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
            animation: `confetti-drop 2.5s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        emoji: ["✨", "⭐", "🌟", "💫", "🦋", "🌸"][i % 6],
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 6,
        size: 12 + Math.random() * 12,
      })),
    [],
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-up"
          style={{
            left: `${p.x}%`,
            bottom: "-10%",
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

function StarCounter({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={20}
          fill={i < count ? "#facc15" : "none"}
          stroke={i < count ? "#f59e0b" : "#9ca3af"}
          className={twMerge(
            "drop-shadow-sm transition-all duration-500",
            i < count && "scale-110 animate-bounce",
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function RobotGuide({
  message,
  isSpeaking,
}: {
  message: string;
  isSpeaking: boolean;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl mx-auto">
      <div className="relative shrink-0">
        <div
          className={twMerge(
            "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl border-4 transition-all duration-300",
            isSpeaking
              ? "border-indigo-400 scale-105 animate-pulse"
              : "border-white/80",
          )}
        >
          <img
            src="/assets/math2-b2-game/robot-guide.png"
            alt="Robot hướng dẫn"
            className="w-full h-full object-cover"
          />
        </div>
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 bg-indigo-500 text-white p-1 rounded-full shadow-lg animate-bounce">
            <Volume2 size={10} />
          </div>
        )}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
          Tí Tách 🤖
        </div>
      </div>
      <div className="relative flex-1 min-w-0">
        <div
          className={twMerge(
            "relative p-3 sm:p-4 rounded-2xl shadow-xl border-4 transition-all duration-300",
            isSpeaking
              ? "bg-white border-indigo-200"
              : "bg-white/95 border-slate-200/60",
          )}
        >
          <div className="absolute -left-3 top-5 w-3 h-3 bg-white rotate-45 border-l-4 border-b-4 border-indigo-200" />
          <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME PLAY COMPONENTS — Choice Mode
   ═══════════════════════════════════════════════════════════════════════════ */

function ChoiceGame({
  task,
  onCorrect,
  onWrong,
}: {
  task: Task;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const options = useMemo(
    () => shuffle([task.answer, ...task.distractors]),
    [task],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePick = (value: number) => {
    if (showResult) return;
    setSelected(value);
    setShowResult(true);

    setTimeout(() => {
      if (value === task.answer) onCorrect();
      else onWrong();
      setSelected(null);
      setShowResult(false);
    }, 800);
  };

  const colors = [
    "from-rose-400 to-rose-500 border-rose-300 hover:from-rose-500 hover:to-rose-600",
    "from-amber-400 to-amber-500 border-amber-300 hover:from-amber-500 hover:to-amber-600",
    "from-emerald-400 to-emerald-500 border-emerald-300 hover:from-emerald-500 hover:to-emerald-600",
    "from-sky-400 to-sky-500 border-sky-300 hover:from-sky-500 hover:to-sky-600",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Anchor Number */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm sm:text-base font-bold text-white/90">
          {task.kind === "prev" ? "⬅ Số liền trước của" : "Số liền sau của ➡"}
        </div>
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-indigo-400 to-indigo-600 border-4 border-white shadow-[0_8px_0_#3730a3,0_12px_20px_rgba(55,48,163,0.4)] flex items-center justify-center">
            <span className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg">
              {task.anchor}
            </span>
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
            {task.kind === "prev" ? "👈" : "👉"}
          </div>
        </div>
        <div className="text-xs sm:text-sm font-bold text-white/80">
          {task.kind === "prev"
            ? `${task.anchor} − 1 = ?`
            : `${task.anchor} + 1 = ?`}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
        {options.map((value, idx) => {
          const isCorrect = value === task.answer;
          const isSelected = selected === value;
          let stateClass = "";
          if (showResult && isSelected) {
            stateClass = isCorrect
              ? "!from-green-400 !to-green-500 !border-green-300 scale-110 ring-4 ring-green-300/60"
              : "!from-red-400 !to-red-500 !border-red-300 scale-95 opacity-70";
          }
          if (showResult && !isSelected && isCorrect) {
            stateClass = "!from-green-400 !to-green-500 !border-green-300 ring-2 ring-green-200/40";
          }

          return (
            <button
              key={`${task.anchor}-${value}-${idx}`}
              onClick={() => handlePick(value)}
              disabled={showResult}
              className={twMerge(
                "relative w-full aspect-square rounded-2xl sm:rounded-3xl",
                "bg-gradient-to-b border-4 shadow-[0_6px_0_rgba(0,0,0,0.15)]",
                "flex items-center justify-center text-3xl sm:text-5xl font-black text-white",
                "transition-all duration-200 active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.15)]",
                "hover:scale-105 hover:-translate-y-1",
                "disabled:pointer-events-none",
                colors[idx % colors.length],
                stateClass,
              )}
            >
              <span className="drop-shadow-lg">{value}</span>
              {showResult && isSelected && isCorrect && (
                <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                  ✅
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <div className="absolute -top-3 -right-3 text-3xl animate-bounce">
                  ❌
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME PLAY COMPONENTS — Drag & Drop Mode
   ═══════════════════════════════════════════════════════════════════════════ */

function DragGame({
  task,
  onCorrect,
  onWrong,
}: {
  task: Task;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const options = useMemo(
    () => shuffle([task.answer, ...task.distractors]),
    [task],
  );
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultCorrect, setResultCorrect] = useState(false);

  const handleDragStart = (value: number) => {
    if (showResult) return;
    setDragValue(value);
  };

  const handleDrop = () => {
    if (dragValue === null || showResult) return;
    const isCorrect = dragValue === task.answer;
    setShowResult(true);
    setResultCorrect(isCorrect);
    setIsOver(false);

    setTimeout(() => {
      if (isCorrect) onCorrect();
      else onWrong();
      setDragValue(null);
      setShowResult(false);
      setResultCorrect(false);
    }, 800);
  };

  // Number line display: anchor ± 2
  const lineNumbers = [];
  for (let i = task.anchor - 2; i <= task.anchor + 2; i++) {
    if (i >= 0) lineNumbers.push(i);
  }

  const trainCarColors = [
    "from-rose-400 to-rose-500",
    "from-amber-400 to-amber-500",
    "from-cyan-400 to-cyan-500",
    "from-emerald-400 to-emerald-500",
    "from-violet-400 to-violet-500",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Number Line as Train */}
      <div className="relative">
        <div className="text-center text-sm font-bold text-white/80 mb-2">
          🚂 Tàu lửa số — Kéo số đúng vào toa trống!
        </div>
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {lineNumbers.map((num, idx) => {
            const isAnchor = num === task.anchor;
            const isTarget = num === task.answer;
            return (
              <div key={num} className="flex items-center">
                {idx > 0 && (
                  <div className="w-2 sm:w-4 h-2 bg-amber-600 rounded-full" />
                )}
                <div
                  className={twMerge(
                    "w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl font-black text-white transition-all duration-300",
                    `bg-gradient-to-b ${trainCarColors[idx % trainCarColors.length]}`,
                    "border-4 shadow-[0_4px_0_rgba(0,0,0,0.15)]",
                    isAnchor && "ring-4 ring-yellow-300/70 scale-110 border-yellow-300",
                    isTarget && !showResult && "!bg-gradient-to-b !from-slate-300 !to-slate-400 border-dashed",
                    isTarget && showResult && resultCorrect && "!from-green-400 !to-green-500 !border-green-300",
                    isTarget && showResult && !resultCorrect && "!from-red-400 !to-red-500 !border-red-300",
                  )}
                  onDragOver={(ev) => {
                    if (isTarget) {
                      ev.preventDefault();
                      setIsOver(true);
                    }
                  }}
                  onDragLeave={() => setIsOver(false)}
                  onDrop={(ev) => {
                    ev.preventDefault();
                    if (isTarget) handleDrop();
                  }}
                >
                  {isTarget ? (
                    showResult ? (
                      <span>{dragValue}</span>
                    ) : (
                      <span className="text-slate-500 text-2xl sm:text-4xl">
                        {isOver ? "📥" : "❓"}
                      </span>
                    )
                  ) : (
                    num
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
            {task.kind === "prev"
              ? `Tìm số liền trước của ${task.anchor}`
              : `Tìm số liền sau của ${task.anchor}`}
          </span>
        </div>
      </div>

      {/* Draggable Options */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        {options.map((value, idx) => (
          <div
            key={`drag-${task.anchor}-${value}-${idx}`}
            draggable={!showResult}
            onDragStart={() => handleDragStart(value)}
            onDragEnd={() => { setDragValue(null); setIsOver(false); }}
            className={twMerge(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl cursor-grab active:cursor-grabbing",
              "bg-gradient-to-b from-white to-slate-100 border-4 border-white shadow-xl",
              "flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-700",
              "transition-all duration-200 hover:scale-110 hover:-translate-y-2 hover:shadow-2xl",
              dragValue === value && "scale-90 opacity-50",
              showResult && "pointer-events-none opacity-60",
            )}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME PLAY COMPONENTS — Input Mode
   ═══════════════════════════════════════════════════════════════════════════ */

function InputGame({
  task,
  onCorrect,
  onWrong,
}: {
  task: Task;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    setShowResult(false);
    inputRef.current?.focus();
  }, [task]);

  const handleSubmit = () => {
    if (showResult || !input.trim()) return;
    const val = parseInt(input.trim(), 10);
    const correct = val === task.answer;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      if (correct) onCorrect();
      else onWrong();
      setInput("");
      setShowResult(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Task Display */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-base sm:text-lg font-bold text-white/90">
          {task.kind === "prev" ? "⬅ Số liền trước của" : "Số liền sau của ➡"}
        </div>

        {/* Visual Number Line */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={twMerge(
            "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white border-4",
            task.kind === "prev"
              ? showResult
                ? isCorrect
                  ? "bg-gradient-to-b from-green-400 to-green-500 border-green-300"
                  : "bg-gradient-to-b from-red-400 to-red-500 border-red-300"
                : "bg-gradient-to-b from-slate-300 to-slate-400 border-dashed border-white/60"
              : "bg-gradient-to-b from-sky-400 to-sky-500 border-sky-300",
          )}>
            {task.kind === "prev" ? (showResult ? input : "?") : task.anchor - 1}
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 border-4 border-yellow-300 shadow-xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white ring-4 ring-yellow-200/50">
            {task.anchor}
          </div>

          <div className={twMerge(
            "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white border-4",
            task.kind === "next"
              ? showResult
                ? isCorrect
                  ? "bg-gradient-to-b from-green-400 to-green-500 border-green-300"
                  : "bg-gradient-to-b from-red-400 to-red-500 border-red-300"
                : "bg-gradient-to-b from-slate-300 to-slate-400 border-dashed border-white/60"
              : "bg-gradient-to-b from-sky-400 to-sky-500 border-sky-300",
          )}>
            {task.kind === "next" ? (showResult ? input : "?") : task.anchor + 1}
          </div>
        </div>

        <div className="text-sm font-bold text-white/80">
          {task.kind === "prev"
            ? `${task.anchor} − 1 = ?`
            : `${task.anchor} + 1 = ?`}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center justify-center gap-3">
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="?"
          disabled={showResult}
          className={twMerge(
            "w-28 sm:w-36 h-16 sm:h-20 text-center text-3xl sm:text-4xl font-black rounded-2xl border-4 shadow-xl outline-none transition-all",
            "bg-white text-slate-800 border-white/80 placeholder:text-slate-400",
            "focus:ring-4 focus:ring-indigo-300/60 focus:border-indigo-400",
            showResult && isCorrect && "!bg-green-100 !border-green-400 !text-green-700",
            showResult && !isCorrect && "!bg-red-100 !border-red-400 !text-red-700",
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={showResult || !input.trim()}
          className={twMerge(
            "h-16 sm:h-20 px-6 sm:px-8 rounded-2xl font-black text-lg sm:text-xl text-white",
            "bg-gradient-to-b from-emerald-400 to-emerald-500 border-4 border-emerald-300",
            "shadow-[0_6px_0_#059669] active:translate-y-1 active:shadow-[0_2px_0_#059669]",
            "hover:from-emerald-500 hover:to-emerald-600 transition-all",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          Trả lời ✅
        </button>
      </div>

      {showResult && (
        <div className="text-center">
          {isCorrect ? (
            <span className="text-lg font-black text-green-300 animate-bounce inline-block">
              ✅ Chính xác!
            </span>
          ) : (
            <span className="text-lg font-black text-red-300 animate-bounce inline-block">
              ❌ Đáp án đúng là {task.answer}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN GAME PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export function Math2B2GamePage() {
  const navigate = useNavigate();
  const sound = useGameSound();

  // Game state
  const [phase, setPhase] = useState<"menu" | "playing" | "levelComplete" | "victory">("menu");
  const [levelIdx, setLevelIdx] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starsEarned, setStarsEarned] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [robotMessage, setRobotMessage] = useState(
    "Chào các bạn nhỏ! Hôm nay chúng mình sẽ chơi trò tìm Số Liền Trước và Số Liền Sau nhé! 🎉",
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const level = LEVELS[levelIdx];
  const currentTask = tasks[taskIdx] ?? null;
  const isPlayingRef = useRef(false);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    isPlayingRef.current = true;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up — auto-complete level with current score
          setPhase("levelComplete");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
      isPlayingRef.current = false;
    };
  }, [phase]);

  const speakText = useCallback(
    (text: string) => {
      setRobotMessage(text);
      setIsSpeaking(true);
      sound.speak(text, () => setIsSpeaking(false));
    },
    [sound],
  );

  const startLevel = useCallback(
    (idx: number) => {
      const lvl = LEVELS[idx];
      const newTasks = generateTasks(lvl);
      setLevelIdx(idx);
      setTasks(newTasks);
      setTaskIdx(0);
      setCombo(0);
      setStreak(0);
      setLives(3);
      setTimeLeft(lvl.timeLimit);
      setPhase("playing");
      setFeedback(null);

      const msg =
        lvl.mode === "choice"
          ? `Level ${lvl.id}: ${lvl.title}! Chọn đáp án đúng nhé!`
          : lvl.mode === "drag"
            ? `Level ${lvl.id}: ${lvl.title}! Kéo số đúng vào vị trí trống nhé!`
            : `Level ${lvl.id}: ${lvl.title}! Gõ đáp án rồi nhấn Trả lời nhé!`;
      speakText(msg);
    },
    [speakText],
  );

  const handleCorrect = useCallback(() => {
    sound.correct();
    const newCombo = combo + 1;
    const multiplier = Math.min(3, 1 + newCombo * 0.25);
    const gain = Math.floor(100 * multiplier);
    setScore((s) => s + gain);
    setCombo(newCombo);
    setStreak((s) => s + 1);
    setFeedback(randomPick(ENCOURAGEMENTS));
    setShowConfetti(true);

    speakText(randomPick(["Giỏi lắm!", "Chính xác!", "Tuyệt vời!", "Đúng rồi!"]));

    setTimeout(() => {
      setShowConfetti(false);
      setFeedback(null);
    }, 1500);

    // Next task or complete
    if (taskIdx + 1 >= tasks.length) {
      setTimeout(() => {
        const stars = lives === 3 ? 3 : lives === 2 ? 2 : 1;
        setStarsEarned((prev) => [...prev, stars]);
        setPhase("levelComplete");
        sound.victory();
        setShowConfetti(true);
        speakText(`Tuyệt vời! Con đã hoàn thành ${level.title}! Được ${stars} sao!`);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 900);
    } else {
      setTimeout(() => setTaskIdx((i) => i + 1), 800);
    }
  }, [combo, taskIdx, tasks.length, lives, level, sound, speakText]);

  const handleWrong = useCallback(() => {
    sound.wrong();
    setCombo(0);
    setStreak(0);
    setLives((l) => Math.max(0, l - 1));
    setFeedback(randomPick(WRONG_ENCOURAGEMENTS));
    setTimeLeft((t) => Math.max(0, t - 3));
    speakText(randomPick(["Chưa đúng rồi, thử lại nhé!", "Cố gắng lên nào!", "Gần đúng rồi!"]));

    setTimeout(() => setFeedback(null), 1500);

    // If out of lives
    if (lives <= 1) {
      setTimeout(() => {
        const stars = 0;
        setStarsEarned((prev) => [...prev, stars]);
        setPhase("levelComplete");
        speakText("Hết mạng rồi! Nhưng không sao, mình chơi lại nhé!");
      }, 900);
    }
  }, [lives, sound, speakText]);

  const handleNextLevel = useCallback(() => {
    if (levelIdx + 1 >= TOTAL_LEVELS) {
      setPhase("victory");
      setShowConfetti(true);
      sound.victory();
      speakText("Chúc mừng! Con đã hoàn thành tất cả các level! Con giỏi lắm!");
    } else {
      startLevel(levelIdx + 1);
    }
  }, [levelIdx, sound, speakText, startLevel]);

  const totalStars = starsEarned.reduce((a, b) => a + b, 0);
  const progressPercent = phase === "playing"
    ? Math.round((taskIdx / Math.max(1, tasks.length)) * 100)
    : 0;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden select-none">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/assets/math2-b2-game/game-background.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/30 via-transparent to-emerald-900/40" />
      </div>

      <FloatingParticles />
      <ConfettiBurst active={showConfetti} />

      {/* ── Top Nav ──────────────────────────────────────── */}
      <div className="relative z-40 bg-white/80 backdrop-blur-xl px-3 sm:px-5 py-2 shadow-lg border-b-2 border-emerald-300/50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-1.5 text-emerald-700 font-extrabold hover:text-emerald-900 transition-colors text-xs sm:text-sm"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Quay lại</span>
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="font-black text-emerald-700 text-xs sm:text-sm">
              Bài 2: Số liền trước & sau
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = sound.toggleSound();
                setSoundOn(next);
              }}
              className="p-1.5 rounded-full bg-white/60 hover:bg-white transition-all"
            >
              {soundOn ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} className="text-slate-400" />}
            </button>
            <div className="flex items-center gap-1 bg-amber-400/90 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
              <Star size={14} fill="currentColor" /> {totalStars}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="relative z-20 max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Robot Guide */}
        <RobotGuide message={robotMessage} isSpeaking={isSpeaking} />

        {/* ═══ PHASE: Menu ═══ */}
        {phase === "menu" && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                🎮 Phiêu lưu Số liền trước & sau
              </h1>
              <p className="text-white/80 font-bold text-sm sm:text-base mt-1">
                Chọn level để bắt đầu!
              </p>
            </div>

            {/* Train Image */}
            <div className="flex justify-center">
              <img
                src="/assets/math2-b2-game/number-train.png"
                alt="Tàu lửa số"
                className="h-24 sm:h-36 object-contain drop-shadow-xl animate-bounce-slow"
              />
            </div>

            {/* Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {LEVELS.map((lvl, idx) => {
                const locked = idx > 0 && starsEarned.length < idx;
                const completed = starsEarned.length > idx;
                const stars = starsEarned[idx] ?? 0;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => !locked && startLevel(idx)}
                    disabled={locked}
                    className={twMerge(
                      "relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-left transition-all duration-300",
                      "border-4 shadow-xl backdrop-blur-sm",
                      locked
                        ? "bg-slate-400/40 border-slate-400/60 opacity-60 cursor-not-allowed"
                        : completed
                          ? "bg-emerald-500/30 border-emerald-300/60 hover:scale-105 hover:-translate-y-1"
                          : "bg-white/20 border-white/40 hover:bg-white/30 hover:scale-105 hover:-translate-y-1",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl sm:text-3xl mb-1">{lvl.emoji}</div>
                        <div className="text-white font-black text-sm sm:text-base">{lvl.title}</div>
                        <div className="text-white/70 font-bold text-xs sm:text-sm">{lvl.subtitle}</div>
                      </div>
                      {locked && <span className="text-2xl">🔒</span>}
                      {completed && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">✅</span>
                          <StarCounter count={stars} total={3} />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-white/60 text-xs font-bold">
                      <span>📝 {lvl.taskCount} câu</span>
                      <span>⏱️ {lvl.timeLimit}s</span>
                      <span>
                        {lvl.mode === "choice"
                          ? "🅰️ Chọn"
                          : lvl.mode === "drag"
                            ? "👆 Kéo thả"
                            : "✏️ Điền số"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ PHASE: Playing ═══ */}
        {phase === "playing" && currentTask && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Stats Bar */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/30">
              <div className="flex flex-wrap items-center justify-between gap-2 text-white font-bold text-xs sm:text-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    <Target size={14} className="text-amber-300" />
                    Level {level.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy size={14} className="text-yellow-300" />
                    {score}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={14} className="text-orange-300" />
                    x{combo}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        size={16}
                        fill={i < lives ? "#ef4444" : "none"}
                        stroke={i < lives ? "#ef4444" : "#6b7280"}
                        className="drop-shadow"
                      />
                    ))}
                  </span>
                  <span className={twMerge(
                    "font-black",
                    timeLeft <= 10 ? "text-red-300 animate-pulse" : "text-white",
                  )}>
                    ⏱️ {formatTime(timeLeft)}
                  </span>
                  <span>
                    📊 {taskIdx + 1}/{tasks.length}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-green-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Level Title */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white font-black text-sm sm:text-base border-2 border-white/30">
                {level.emoji} {level.title}
              </span>
            </div>

            {/* Feedback Toast */}
            {feedback && (
              <div className="text-center animate-bounce">
                <span className="inline-block bg-white/90 backdrop-blur text-slate-800 font-black text-base sm:text-lg px-5 py-2 rounded-full shadow-xl border-2 border-amber-200">
                  {feedback}
                </span>
              </div>
            )}

            {/* Game Area */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border-2 border-white/20 shadow-2xl min-h-[300px] flex items-center justify-center">
              {level.mode === "choice" && (
                <ChoiceGame
                  task={currentTask}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
              {level.mode === "drag" && (
                <DragGame
                  task={currentTask}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
              {level.mode === "input" && (
                <InputGame
                  task={currentTask}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
            </div>
          </div>
        )}

        {/* ═══ PHASE: Level Complete ═══ */}
        {phase === "levelComplete" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 py-6 animate-fade-in-up">
            <img
              src="/assets/math2-b2-game/star-reward.png"
              alt="Phần thưởng"
              className="h-28 sm:h-40 object-contain drop-shadow-2xl animate-bounce-slow"
            />
            <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg text-center">
              {lives > 0 ? "🎉 Hoàn thành Level!" : "💪 Hết mạng!"}
            </h2>
            <StarCounter count={starsEarned[levelIdx] ?? 0} total={3} />
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white/30 text-center space-y-2">
              <div className="text-white font-bold">
                <span className="text-2xl sm:text-3xl font-black text-yellow-300">{score}</span>{" "}
                điểm
              </div>
              <div className="text-white/80 text-sm font-bold">
                Streak cao nhất: {streak} | Combo: x{combo}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={() => startLevel(levelIdx)}
                className="bg-white/90 text-slate-800 font-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-xl hover:bg-white transition-all hover:scale-105"
              >
                🔄 Chơi lại
              </button>
              {levelIdx + 1 < TOTAL_LEVELS ? (
                <button
                  onClick={handleNextLevel}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-[0_6px_0_#4338ca] active:translate-y-1 active:shadow-[0_2px_0_#4338ca] hover:-translate-y-1 hover:shadow-[0_8px_0_#4338ca] transition-all"
                >
                  ▶️ Level tiếp theo
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPhase("victory");
                    setShowConfetti(true);
                    sound.victory();
                  }}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  🏆 Xem kết quả
                </button>
              )}
              <button
                onClick={() => setPhase("menu")}
                className="bg-white/40 text-white font-black text-sm px-5 py-3 rounded-2xl hover:bg-white/60 transition-all"
              >
                📋 Menu
              </button>
            </div>
          </div>
        )}

        {/* ═══ PHASE: Victory ═══ */}
        {phase === "victory" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 py-6 animate-fade-in-up">
            <div className="text-6xl sm:text-8xl animate-bounce">🏆</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg text-center">
              Chúc mừng! 🎊
            </h2>
            <p className="text-white/90 font-bold text-base sm:text-lg text-center max-w-md">
              Con đã hoàn thành tất cả {TOTAL_LEVELS} level! Tổng điểm:{" "}
              <span className="text-yellow-300 text-2xl font-black">{score}</span>
            </p>

            {/* Stars summary */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              {LEVELS.map((lvl, idx) => (
                <div
                  key={lvl.id}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border-2 border-white/30 text-center"
                >
                  <div className="text-lg">{lvl.emoji}</div>
                  <div className="text-white font-bold text-[10px] sm:text-xs mt-1">
                    Level {lvl.id}
                  </div>
                  <StarCounter count={starsEarned[idx] ?? 0} total={3} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
              <button
                onClick={() => {
                  setScore(0);
                  setStarsEarned([]);
                  setPhase("menu");
                  setShowConfetti(false);
                }}
                className="bg-white/90 text-slate-800 font-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-xl hover:bg-white transition-all hover:scale-105"
              >
                🔄 Chơi lại từ đầu
              </button>
              <button
                onClick={() => navigate("/student")}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm sm:text-base px-6 py-3 rounded-2xl shadow-[0_6px_0_#4338ca] active:translate-y-1 active:shadow-[0_2px_0_#4338ca] hover:-translate-y-1 hover:shadow-[0_8px_0_#4338ca] transition-all"
              >
                🏠 Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CSS Animations ────────────────────────────── */}
      <style>{`
        @keyframes confetti-drop {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-120vh) scale(0.3); opacity: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-up { animation: float-up var(--duration, 10s) ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
