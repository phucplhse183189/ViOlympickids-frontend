import { useState } from "react";

// ── True / False Exercise ─────────────────────────────────────────────────────
// Student taps "Đúng" (True) or "Sai" (False) — two big colourful buttons.

interface TrueFalseExerciseProps {
  isTrue: boolean;
  disabled: boolean;
  onAnswer: (selectedTrue: boolean, isCorrect: boolean) => void;
}

export function TrueFalseExercise({
  isTrue,
  disabled,
  onAnswer,
}: TrueFalseExerciseProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (answer: boolean) => {
    if (selected !== null || disabled) return;
    setSelected(answer);
    onAnswer(answer, answer === isTrue);
  };

  const btnStyle = (value: boolean) => {
    // Idle — no answer yet
    if (selected === null) {
      return value
        ? "bg-green-400 border-green-500 shadow-[0_6px_0_#15803d] hover:scale-[1.04] hover:-translate-y-1 cursor-pointer"
        : "bg-red-400 border-red-500 shadow-[0_6px_0_#991b1b] hover:scale-[1.04] hover:-translate-y-1 cursor-pointer";
    }

    const isCorrectAnswer = value === isTrue;
    const isThisSelected = selected === value;

    if (isCorrectAnswer) {
      return "bg-green-400 border-green-300 shadow-[0_6px_0_#15803d] scale-[1.06]";
    }
    if (isThisSelected && !isCorrectAnswer) {
      return "bg-red-400 border-red-300 shadow-none opacity-95 animate-[shake_0.4s_ease-in-out]";
    }
    return value
      ? "bg-green-400 border-green-500 opacity-35 cursor-not-allowed"
      : "bg-red-400 border-red-500 opacity-35 cursor-not-allowed";
  };

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      {([true, false] as const).map((value) => (
        <button
          key={String(value)}
          onClick={() => handleSelect(value)}
          disabled={selected !== null || disabled}
          className={`
            relative w-full rounded-3xl border-4 transition-all duration-200 select-none
            flex flex-col items-center justify-center gap-2 py-7 px-4
            ${btnStyle(value)}
          `}
        >
          <span className="text-5xl leading-none">
            {value ? "👍" : "👎"}
          </span>
          <span className="text-white font-extrabold text-xl drop-shadow">
            {value ? "Đúng" : "Sai"}
          </span>

          {/* Correct glow ring */}
          {selected !== null && value === isTrue && (
            <span className="absolute inset-0 rounded-3xl ring-4 ring-white/60 animate-ping pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  );
}
