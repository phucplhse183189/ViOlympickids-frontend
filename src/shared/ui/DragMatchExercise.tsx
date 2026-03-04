import { useState, useMemo } from "react";

// ── Drag-Match (Tap-to-Pair) Exercise ─────────────────────────────────────────
// Student taps one item from the left column, then taps its match on the right.
// When all pairs are matched, auto-submit and report correctness.

export interface MatchPair {
  left: string;
  right: string;
}

interface DragMatchExerciseProps {
  pairs: MatchPair[];
  disabled: boolean;
  onComplete: (allCorrect: boolean) => void;
}

export function DragMatchExercise({
  pairs,
  disabled,
  onComplete,
}: DragMatchExerciseProps) {
  // Shuffle right column once
  const shuffledRight = useMemo(() => {
    const arr = pairs.map((p, i) => ({ text: p.right, originalIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  // Map: leftIdx → originalRightIdx (the index of the right column item they matched to)
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const matchedRightIdxs = useMemo(
    () => new Set(matches.values()),
    [matches],
  );

  const handleLeftClick = (idx: number) => {
    if (submitted || disabled || matches.has(idx)) return;
    setSelectedLeft((prev) => (prev === idx ? null : idx));
  };

  const handleRightClick = (originalIdx: number) => {
    if (submitted || disabled || selectedLeft === null) return;
    if (matchedRightIdxs.has(originalIdx)) return;

    const newMatches = new Map(matches);
    newMatches.set(selectedLeft, originalIdx);
    setMatches(newMatches);
    setSelectedLeft(null);

    // Auto-submit when all matched
    if (newMatches.size === pairs.length) {
      const correctResults = pairs.map((_, i) => newMatches.get(i) === i);
      setResults(correctResults);
      setSubmitted(true);
      onComplete(correctResults.every(Boolean));
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const leftStyle = (idx: number) => {
    if (submitted) {
      return results[idx]
        ? "bg-green-100 border-green-400 text-green-800"
        : "bg-red-100 border-red-400 text-red-800";
    }
    if (matches.has(idx))
      return "bg-indigo-50 border-indigo-200 text-indigo-400 opacity-60";
    if (selectedLeft === idx)
      return "bg-yellow-100 border-yellow-400 text-yellow-800 scale-[1.03] shadow-md";
    return "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 cursor-pointer";
  };

  const rightStyle = (originalIdx: number) => {
    if (submitted) {
      const leftIdx = [...matches.entries()].find(
        ([, v]) => v === originalIdx,
      )?.[0];
      if (leftIdx !== undefined) {
        return results[leftIdx]
          ? "bg-green-100 border-green-400 text-green-800"
          : "bg-red-100 border-red-400 text-red-800";
      }
      return "bg-gray-50 border-gray-200 text-gray-400";
    }
    if (matchedRightIdxs.has(originalIdx))
      return "bg-indigo-50 border-indigo-200 text-indigo-400 opacity-60";
    if (selectedLeft !== null)
      return "bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400 cursor-pointer animate-pulse";
    return "bg-white border-gray-200 text-gray-700";
  };

  // ── Match number badge ──────────────────────────────────────────────────

  const getMatchNumber = (leftIdx: number) => {
    if (!matches.has(leftIdx)) return null;
    return leftIdx + 1;
  };

  const getRightMatchNumber = (origIdx: number) => {
    const entry = [...matches.entries()].find(([, v]) => v === origIdx);
    if (!entry) return null;
    return entry[0] + 1;
  };

  return (
    <div className="w-full rounded-3xl border-2 border-indigo-100 bg-white p-4 flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-500 text-center">
        👈 Chọn bên trái, rồi chọn bên phải để ghép đôi! 👉
      </p>

      <div className="grid grid-cols-[1fr_24px_1fr] gap-x-2 gap-y-2 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-2">
          {pairs.map((pair, idx) => (
            <button
              key={`l-${idx}`}
              onClick={() => handleLeftClick(idx)}
              disabled={submitted || disabled || matches.has(idx)}
              className={`relative w-full p-3 rounded-2xl border-2 font-bold text-sm text-center transition-all duration-200 ${leftStyle(idx)}`}
            >
              {pair.left}
              {getMatchNumber(idx) && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                  {getMatchNumber(idx)}
                </span>
              )}
              {submitted && (
                <span className="ml-1">{results[idx] ? "✅" : "❌"}</span>
              )}
            </button>
          ))}
        </div>

        {/* Arrow column */}
        <div className="flex flex-col gap-2 items-center justify-center pt-1">
          {pairs.map((_, idx) => (
            <div
              key={`a-${idx}`}
              className="h-[44px] flex items-center text-gray-300 text-sm"
            >
              ↔
            </div>
          ))}
        </div>

        {/* Right column (shuffled) */}
        <div className="flex flex-col gap-2">
          {shuffledRight.map((item) => (
            <button
              key={`r-${item.originalIdx}`}
              onClick={() => handleRightClick(item.originalIdx)}
              disabled={
                submitted ||
                disabled ||
                matchedRightIdxs.has(item.originalIdx)
              }
              className={`relative w-full p-3 rounded-2xl border-2 font-bold text-sm text-center transition-all duration-200 ${rightStyle(item.originalIdx)}`}
            >
              {item.text}
              {getRightMatchNumber(item.originalIdx) && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                  {getRightMatchNumber(item.originalIdx)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Final result */}
      {submitted && (
        <div className="text-center text-sm font-bold animate-slide-up mt-1">
          {results.every(Boolean) ? (
            <span className="text-green-600">🎉 Tuyệt vời! Ghép đúng tất cả!</span>
          ) : (
            <span className="text-red-600">
              ❌ Có {results.filter((r) => !r).length} cặp chưa đúng
            </span>
          )}
        </div>
      )}
    </div>
  );
}
