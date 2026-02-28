import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lightbulb, X } from "lucide-react";
import {
  getLessonById,
  getChapterByLessonId,
  type QuizQuestion,
} from "@/shared/api/studentMockData";

type AnswerState = "idle" | "correct" | "wrong";

// ── Card colour themes for each option ────────────────────────────────────────
const CARD_THEMES = [
  { bg: "bg-sky-400",    border: "border-sky-500",    shadow: "shadow-sky-600",    glow: "#38bdf8" },
  { bg: "bg-violet-400", border: "border-violet-500", shadow: "shadow-violet-600", glow: "#a78bfa" },
  { bg: "bg-green-400",  border: "border-green-500",  shadow: "shadow-green-600",  glow: "#4ade80" },
  { bg: "bg-orange-400", border: "border-orange-500", shadow: "shadow-orange-600", glow: "#fb923c" },
];

// ── Decorative emojis next to option text ─────────────────────────────────────
const OPTION_ICONS = ["🔵", "🟣", "🟢", "🟠"];
const LETTERS      = ["A", "B", "C", "D"];

// ── Mini confetti burst (CSS-only) ────────────────────────────────────────────
const CONFETTI_EMOJI = ["⭐", "🎉", "✨", "💫", "🌟", "🎊"];
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    dur:   `${0.8 + Math.random() * 0.7}s`,
    size:  `${0.9 + Math.random() * 0.7}rem`,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-3xl">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: p.left,
            fontSize: p.size,
            animation: `confetti-drop ${p.dur} ${p.delay} ease-in forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ── Answer card ───────────────────────────────────────────────────────────────
interface CardProps {
  text: string;
  index: number;
  selected: boolean;
  answerState: AnswerState;
  correctIndex: number;
  disabled: boolean;
  onClick: () => void;
}

function AnswerCard({ text, index, selected, answerState, correctIndex, disabled, onClick }: CardProps) {
  const theme = CARD_THEMES[index % 4];
  const isCorrectCard = index === correctIndex;
  const isWrongSelected = selected && answerState === "wrong";

  // Determine visual state
  let cardCls = "";
  let overlayEmoji = "";

  if (!disabled) {
    // Idle state
    cardCls = `${theme.bg} border-4 ${theme.border} shadow-[0_6px_0_var(--card-shadow)] hover:scale-[1.04] hover:-translate-y-1 active:translate-y-1 active:shadow-none cursor-pointer`;
  } else if (isCorrectCard) {
    cardCls = "bg-green-400 border-4 border-green-300 shadow-[0_6px_0_#15803d] scale-[1.06]";
    overlayEmoji = "✅";
  } else if (isWrongSelected) {
    cardCls = "bg-red-400 border-4 border-red-300 shadow-none opacity-95";
    overlayEmoji = "❌";
  } else {
    cardCls = `${theme.bg} border-4 ${theme.border} opacity-35 cursor-not-allowed`;
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative w-full rounded-3xl transition-all duration-200 select-none overflow-hidden
        flex flex-col items-center justify-center gap-2 py-5 px-3
        ${cardCls}
        ${isWrongSelected ? "animate-[shake_0.4s_ease-in-out]" : ""}
      `}
      style={{ "--card-shadow": theme.glow } as React.CSSProperties}
    >
      {/* Letter badge */}
      <span className="absolute top-2.5 left-3 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[11px] font-extrabold text-white">
        {overlayEmoji || LETTERS[index]}
      </span>

      {/* Option icon */}
      <span className="text-3xl leading-none">{OPTION_ICONS[index]}</span>

      {/* Text */}
      <span className="text-white font-extrabold text-base leading-snug text-center px-2">
        {text}
      </span>

      {/* Correct glow ring */}
      {isCorrectCard && disabled && (
        <span className="absolute inset-0 rounded-3xl ring-4 ring-white/60 animate-ping pointer-events-none" />
      )}
    </button>
  );
}

// ── Robot mood ────────────────────────────────────────────────────────────────
const ROBOT_MOOD: Record<AnswerState, { face: string; bubble: string; bg: string }> = {
  idle:    { face: "🤔", bubble: "Hãy chọn đáp án bé cho là đúng nhé!",         bg: "from-orange-300 to-orange-500" },
  correct: { face: "🥳", bubble: "Xuất sắc! Bé làm đúng rồi! Tiếp tục nào! 🚀", bg: "from-green-300 to-green-500"   },
  wrong:   { face: "😢", bubble: "Không sao! Xem đáp án đúng và cố lên nhé! 💪", bg: "from-red-300 to-red-400"       },
};

// ── Star progress dots ────────────────────────────────────────────────────────
function StarProgress({ current, total, correct }: { current: number; total: number; correct: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="text-xl transition-all duration-300"
          style={{
            transform: i < current ? "scale(1)" : "scale(0.7)",
            filter:    i < current ? (i < correct ? "none" : "grayscale(0.6)") : "grayscale(1)",
            opacity:   i < current ? 1 : 0.35,
          }}
        >
          {i < current ? (i < correct ? "⭐" : "💔") : "☆"}
        </span>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lessonId = Number(id);
  const lesson  = getLessonById(lessonId);
  const chapter = getChapterByLessonId(lessonId);

  const [currentIdx,      setCurrentIdx]      = useState(0);
  const [selectedOption,  setSelectedOption]  = useState<number | null>(null);
  const [answerState,     setAnswerState]      = useState<AnswerState>("idle");
  const [showHint,        setShowHint]         = useState(false);
  const [correctCount,    setCorrectCount]     = useState(0);
  const [answeredCount,   setAnsweredCount]    = useState(0); // for star progress
  const [showConfetti,    setShowConfetti]     = useState(false);
  const [animating,       setAnimating]        = useState(false);
  const [hearts,          setHearts]           = useState(3);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedOption(null);
    setAnswerState("idle");
    setShowHint(false);
    setShowConfetti(false);
  }, [currentIdx]);

  if (!lesson || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] gap-4">
        <span className="text-6xl">😕</span>
        <p className="text-xl font-extrabold text-gray-600">Không tìm thấy bài học!</p>
        <button onClick={() => navigate("/student")} className="px-6 py-3 bg-orange-400 text-white font-extrabold rounded-2xl">← Quay lại</button>
      </div>
    );
  }

  const questions = lesson.questions as QuizQuestion[];
  const q         = questions[currentIdx];
  const mood      = ROBOT_MOOD[answerState];

  const handleSelect = (idx: number) => {
    if (answerState !== "idle" || animating) return;
    setSelectedOption(idx);
    setAnsweredCount((c) => c + 1);

    const isCorrect = idx === q.correctIndex;
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        navigate(`/student/result/${lessonId}`, {
          state: { correct: correctCount + (answerState === "correct" ? 1 : 0), total: questions.length },
        });
      } else {
        setCurrentIdx((i) => i + 1);
        setAnimating(false);
      }
    }, 320);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Playful animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100" />
      {[
        { top: "8%",  left: "6%",  s: "text-4xl", d: "0s"   },
        { top: "15%", left: "88%", s: "text-3xl", d: "1.2s" },
        { top: "70%", left: "4%",  s: "text-3xl", d: "2s"   },
        { top: "75%", left: "90%", s: "text-4xl", d: "0.7s" },
      ].map((c, i) => (
        <span key={i} className="absolute pointer-events-none animate-float-slow opacity-40"
          style={{ top: c.top, left: c.left, fontSize: c.s, animationDelay: c.d }}>
          {["☁️", "🌟", "✨", "💫"][i]}
        </span>
      ))}

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col h-full min-h-[calc(100vh-5rem)]"
        style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s" }}
      >
        {/* ── TOP BAR ── */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          {/* Close */}
          <button
            onClick={() => navigate(`/student/lesson/${lessonId}`)}
            className="p-2.5 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={18} className="text-gray-500" />
          </button>

          {/* Star progress (replaces thin bar) */}
          <div className="flex-1 flex justify-center">
            <StarProgress current={answeredCount} total={questions.length} correct={correctCount} />
          </div>

          {/* Hearts */}
          <div className="flex gap-0.5 shrink-0">
            {[1, 2, 3].map((n) => (
              <span key={n} className="text-xl transition-all duration-300"
                style={{ opacity: n <= hearts ? 1 : 0.2, transform: n <= hearts ? "scale(1)" : "scale(0.75)" }}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 flex flex-col items-center px-4 pb-6 gap-4 max-w-xl mx-auto w-full">

          {/* Chapter chip */}
          <div className={`${chapter.color} text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-sm mt-1`}>
            {chapter.emoji} {chapter.title} · Câu {currentIdx + 1}/{questions.length}
          </div>

          {/* ── ROBOT + QUESTION bubble ── */}
          <div className="w-full flex items-end gap-3">
            {/* Robot avatar */}
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${mood.bg} flex items-center justify-center text-3xl shadow-lg border-4 border-white transition-all duration-300`}>
                {mood.face}
              </div>
              {/* bouncing indicator */}
              {answerState === "idle" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-bounce" />
              )}
            </div>

            {/* Speech bubble */}
            <div className="relative flex-1 bg-white rounded-3xl rounded-bl-none shadow-xl px-5 py-4">
              {/* Bubble tail */}
              <div className="absolute -left-3 bottom-5 w-4 h-4 bg-white"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />

              {/* Hint text OR question */}
              {showHint ? (
                <div className="flex items-start gap-2">
                  <Lightbulb size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-yellow-700">{q.hint}</p>
                </div>
              ) : answerState !== "idle" ? (
                <div className="flex items-start gap-2">
                  <span className="text-xl shrink-0">{answerState === "correct" ? "🎉" : "💡"}</span>
                  <p className={`text-sm font-bold leading-snug ${answerState === "correct" ? "text-green-700" : "text-gray-700"}`}>
                    {answerState === "correct" ? q.explanation : `Đáp án đúng: ${q.options[q.correctIndex]}`}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-600 leading-snug">{mood.bubble}</p>
              )}
            </div>
          </div>

          {/* ── QUESTION CARD ── */}
          <div className="relative w-full bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 px-6 py-5 text-center overflow-hidden">
            <ConfettiBurst show={showConfetti} />
            {q.emoji && (
              <div
                className="text-6xl mb-3 transition-transform duration-300"
                style={{ transform: answerState === "correct" ? "scale(1.2)" : "scale(1)" }}
              >
                {q.emoji}
              </div>
            )}
            <p className="text-xl font-extrabold text-gray-800 leading-snug">{q.text}</p>
          </div>

          {/* ── ANSWER CARDS 2×2 ── */}
          <div className="w-full grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <AnswerCard
                key={i}
                text={opt}
                index={i}
                selected={selectedOption === i}
                answerState={answerState}
                correctIndex={q.correctIndex}
                disabled={answerState !== "idle"}
                onClick={() => handleSelect(i)}
              />
            ))}
          </div>

          {/* ── BOTTOM ACTIONS ── */}
          {answerState === "idle" ? (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all border-2 ${
                showHint
                  ? "bg-yellow-300 border-yellow-400 text-yellow-900"
                  : "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              }`}
            >
              <Lightbulb size={18} />
              {showHint ? "Ẩn gợi ý" : "💡 Xem gợi ý"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 font-extrabold text-lg rounded-2xl text-white transition-all active:scale-[0.97] shadow-[0_5px_0_rgba(0,0,0,0.2)] ${
                answerState === "correct"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : "bg-gradient-to-r from-orange-400 to-orange-500"
              }`}
            >
              {currentIdx + 1 < questions.length ? "Câu tiếp theo →" : "🎯 Xem kết quả!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}