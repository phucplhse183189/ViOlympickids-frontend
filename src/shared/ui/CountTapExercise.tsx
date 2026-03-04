import { useState, useCallback } from "react";
import { Minus, Plus, Check } from "lucide-react";

// ── Count-Tap Exercise ────────────────────────────────────────────────────────
// Student increments / decrements a counter to guess the right number.
// Used for "How many faces / edges / vertices?" type questions.

interface CountTapExerciseProps {
  label: string; // "mặt" | "cạnh" | "đỉnh"
  targetCount: number;
  maxCount?: number;
  disabled: boolean;
  onSubmit: (count: number, isCorrect: boolean) => void;
}

export function CountTapExercise({
  label,
  targetCount,
  maxCount = 20,
  disabled,
  onSubmit,
}: CountTapExerciseProps) {
  const [count, setCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [popKey, setPopKey] = useState(0); // triggers pop animation
  const isCorrect = count === targetCount;

  const increment = useCallback(() => {
    if (submitted || disabled) return;
    setCount((c) => Math.min(maxCount, c + 1));
    setPopKey((k) => k + 1);
  }, [submitted, disabled, maxCount]);

  const decrement = useCallback(() => {
    if (submitted || disabled) return;
    setCount((c) => Math.max(0, c - 1));
    setPopKey((k) => k + 1);
  }, [submitted, disabled]);

  const handleSubmit = () => {
    if (submitted || disabled) return;
    setSubmitted(true);
    onSubmit(count, count === targetCount);
  };

  const ringColor = submitted
    ? isCorrect
      ? "ring-green-400"
      : "ring-red-400"
    : "ring-indigo-200";

  return (
    <div
      className={`w-full rounded-3xl border-2 p-6 flex flex-col items-center gap-5 transition-all duration-300 ${
        submitted
          ? isCorrect
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
          : "bg-white border-indigo-100"
      }`}
    >
      {/* Instruction */}
      <p className="text-sm font-bold text-gray-500 text-center">
        Đếm số{" "}
        <span className="text-indigo-600 font-extrabold">{label}</span> rồi bấm
        xác nhận!
      </p>

      {/* Counter row */}
      <div className="flex items-center gap-5">
        {/* Minus */}
        <button
          onClick={decrement}
          disabled={submitted || disabled || count <= 0}
          className="w-14 h-14 rounded-full bg-red-100 hover:bg-red-200 border-2 border-red-300 
                     flex items-center justify-center transition-all active:scale-90 
                     disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Minus size={24} className="text-red-600" />
        </button>

        {/* Number display */}
        <div
          key={popKey}
          className={`w-20 h-20 rounded-2xl ring-4 ${ringColor} flex items-center justify-center 
                      text-4xl font-black transition-all duration-300 animate-count-pop ${
                        submitted
                          ? isCorrect
                            ? "bg-green-400 text-white scale-110"
                            : "bg-red-400 text-white animate-[shake_0.4s_ease-in-out]"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
        >
          {count}
        </div>

        {/* Plus */}
        <button
          onClick={increment}
          disabled={submitted || disabled || count >= maxCount}
          className="w-14 h-14 rounded-full bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 
                     flex items-center justify-center transition-all active:scale-90 
                     disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Plus size={24} className="text-blue-600" />
        </button>
      </div>

      {/* Result feedback */}
      {submitted && (
        <div className="flex items-center gap-2 text-sm font-bold animate-slide-up">
          {isCorrect ? (
            <span className="text-green-600">
              ✅ Chính xác! {label} = {targetCount}
            </span>
          ) : (
            <span className="text-red-600">
              ❌ Đáp án đúng: {targetCount} {label}
            </span>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted && !disabled && (
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-extrabold 
                     rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none 
                     transition-all flex items-center gap-2 hover:brightness-105"
        >
          <Check size={18} />
          Xác nhận
        </button>
      )}
    </div>
  );
}
