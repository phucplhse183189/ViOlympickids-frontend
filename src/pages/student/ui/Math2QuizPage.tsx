// AI voice function
function speak(text: string) {
  // Đã tắt giọng AI để tránh chồng với audio thu âm sẵn.
  void text;
}
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { MATH2_B2_QUIZ, type Math2QuizQuestion } from "@/shared/api/math2Data";

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_THEMES = [
  { bg: "bg-sky-400", border: "border-sky-500", glow: "#38bdf8" },
  { bg: "bg-violet-400", border: "border-violet-500", glow: "#a78bfa" },
  { bg: "bg-green-400", border: "border-green-500", glow: "#4ade80" },
  { bg: "bg-orange-400", border: "border-orange-500", glow: "#fb923c" },
];
const LETTERS = ["A", "B", "C", "D"];
const CONFETTI_EMOJI = ["⭐", "🎉", "✨", "💫", "🌟", "🎊"];

type AnswerState = "idle" | "correct" | "wrong";

// ── Confetti burst ────────────────────────────────────────────────────────────

function ConfettiBurst({ show }: Readonly<{ show: boolean }>) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
        dur: `${0.8 + Math.random() * 0.7}s`,
        size: `${0.9 + Math.random() * 0.7}rem`,
      })),
    [],
  );
  if (!show) return null;
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

// ── Answer Card ───────────────────────────────────────────────────────────────

function AnswerCard({
  text,
  index,
  selected,
  answerState,
  correctIndex,
  disabled,
  onClick,
}: Readonly<{
  text: string;
  index: number;
  selected: boolean;
  answerState: AnswerState;
  correctIndex: number;
  disabled: boolean;
  onClick: () => void;
}>) {
  const theme = CARD_THEMES[index % 4];
  const isCorrectCard = index === correctIndex;
  const isWrongSelected = selected && answerState === "wrong";

  let cardCls = "";
  let overlayEmoji = "";

  if (!disabled) {
    cardCls = `${theme.bg} border-4 ${theme.border} shadow-[0_6px_0_var(--card-shadow)] hover:scale-[1.04] hover:-translate-y-1 active:translate-y-1 active:shadow-none cursor-pointer`;
  } else if (isCorrectCard) {
    cardCls =
      "bg-green-400 border-4 border-green-300 shadow-[0_6px_0_#15803d] scale-[1.06]";
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
      <span className="absolute top-2.5 left-3 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[11px] font-extrabold text-white">
        {overlayEmoji || LETTERS[index]}
      </span>
      <span className="text-white font-extrabold text-base leading-snug text-center px-2">
        {text}
      </span>
      {isCorrectCard && disabled && (
        <span className="absolute inset-0 rounded-3xl ring-4 ring-white/60 animate-ping pointer-events-none" />
      )}
    </button>
  );
}

// ── Star progress ─────────────────────────────────────────────────────────────

function StarProgress({
  current,
  total,
  correctCount,
}: Readonly<{ current: number; total: number; correctCount: number }>) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="text-xl transition-all duration-300"
          style={{
            transform: i < current ? "scale(1)" : "scale(0.7)",
            opacity: i < current ? 1 : 0.35,
          }}
        >
          {i < current ? (i < correctCount ? "⭐" : "💔") : "☆"}
        </span>
      ))}
    </div>
  );
}

// ── Robot mood ─────────────────────────────────────────────────────────────────

const ROBOT_MOOD: Record<AnswerState, { face: string; bubble: string }> = {
  idle: { face: "🤔", bubble: "Đọc kỹ câu hỏi rồi chọn đáp án nhé!" },
  correct: { face: "🥳", bubble: "Xuất sắc! Bé làm đúng rồi! 🚀" },
  wrong: { face: "😢", bubble: "Không sao! Xem lại đáp án đúng nhé! 💪" },
};

// ── Main Quiz Page ────────────────────────────────────────────────────────────

export function Math2QuizPage() {
  const navigate = useNavigate();
  const questions: Math2QuizQuestion[] = MATH2_B2_QUIZ;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setAnswerState("idle");
    setShowConfetti(false);
    setShowExplanation(false);
    // Speak question when moving to new question
    speak(questions[currentIdx].question);
  }, [currentIdx]);

  const q = questions[currentIdx];
  const mood = ROBOT_MOOD[answerState];

  const handleSelect = (idx: number) => {
    if (answerState !== "idle" || animating) return;
    setSelectedOption(idx);
    setAnsweredCount((c) => c + 1);

    // Speak answer
    speak(q.options[idx]);

    const isCorrect = idx === q.correctIndex;
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
    setTimeout(() => setShowExplanation(true), 900);
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        navigate("/student/result/math2-b2", {
          state: { correct: correctCount, total: questions.length },
        });
      } else {
        setCurrentIdx((i) => i + 1);
        setAnimating(false);
      }
    }, 320);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100" />
      {["☁️", "🌟", "✨", "💫"].map((e, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-float-slow opacity-40"
          style={{
            top: `${[8, 15, 70, 75][i]}%`,
            left: `${[6, 88, 4, 90][i]}%`,
            fontSize: "2rem",
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {e}
        </span>
      ))}

      <div
        className="relative z-10 flex flex-col h-full min-h-[calc(100vh-5rem)]"
        style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s" }}
      >
        {/* TOP BAR */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button
            onClick={() => navigate("/student")}
            className="p-2.5 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={18} className="text-gray-500" />
          </button>
          <div className="flex-1 flex justify-center">
            <StarProgress
              current={answeredCount}
              total={questions.length}
              correctCount={correctCount}
            />
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`text-xl transition-all ${i < hearts ? "" : "grayscale opacity-30"}`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8 overflow-y-auto">
          {/* Robot */}
          <div className="flex items-end gap-2 mb-4 self-start ml-2">
            <div className="w-16 h-16 bg-gradient-to-b from-sky-400 to-sky-500 rounded-2xl border-4 border-sky-300 flex flex-col items-center justify-center shadow-lg">
              <span className="text-2xl">{mood.face}</span>
            </div>
            <div className="relative bg-white rounded-2xl shadow-lg px-4 py-2.5 max-w-[260px]">
              <div className="absolute -left-2 bottom-3 w-4 h-4 bg-white rotate-45" />
              <p className="text-sm font-bold text-gray-700 relative z-10">
                {mood.bubble}
              </p>
            </div>
          </div>

          {/* Chapter chip */}
          <div className="mb-3">
            <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-4 py-1.5 rounded-full">
              📊 Bài 2: Tia số · Số liền trước, số liền sau
            </span>
          </div>

          {/* Question card */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-white/80">
            <ConfettiBurst show={showConfetti} />

            <div className="relative z-10 p-5 sm:p-6">
              {/* Question number */}
              <p className="text-center text-xs font-extrabold text-gray-400 mb-2">
                Câu {currentIdx + 1} / {questions.length}
              </p>

              {/* Visual hint */}
              {q.visual && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-4 py-3 mb-4 text-center">
                  <p className="text-lg font-extrabold text-indigo-600 tracking-wider">
                    {q.visual}
                  </p>
                </div>
              )}

              {/* Question text */}
              <h2 className="text-center text-lg sm:text-xl font-extrabold text-gray-800 mb-5 leading-snug">
                {q.question}
              </h2>

              {/* Options grid */}
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, idx) => (
                  <AnswerCard
                    key={`${q.id}-${idx}`}
                    text={opt}
                    index={idx}
                    selected={selectedOption === idx}
                    answerState={answerState}
                    correctIndex={q.correctIndex}
                    disabled={answerState !== "idle"}
                    onClick={() => handleSelect(idx)}
                  />
                ))}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mt-5 animate-fade-in-up">
                  <div
                    className={`rounded-2xl p-4 border-2 ${
                      answerState === "correct"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-700">
                      💡 {q.explanation}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      speak(q.explanation);
                      handleNext();
                    }}
                    className="mt-4 w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white
                               text-lg font-extrabold rounded-2xl shadow-[0_5px_0_#c2550f]
                               active:translate-y-[3px] active:shadow-none transition-all
                               flex items-center justify-center gap-2"
                  >
                    {currentIdx + 1 >= questions.length
                      ? "🎯 Xem kết quả!"
                      : "Câu tiếp theo →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
