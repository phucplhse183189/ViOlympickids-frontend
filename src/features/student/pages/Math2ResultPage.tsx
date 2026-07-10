import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, Home } from "lucide-react";
import * as lessonService from "@/features/student/api/lessonService";
import { useActiveChild } from "@/features/dashboard/context/activeChild";

interface LocationState {
  correct: number;
  total: number;
}

const confettiItems = ["🎉", "⭐", "🌟", "🎊", "💫", "✨", "🎈", "🏅"];

function Confetti({ show }: Readonly<{ show: boolean }>) {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i / 28) * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.2 + Math.random() * 1.2}s`,
    emoji: confettiItems[i % confettiItems.length],
    size: `${0.9 + Math.random() * 0.8}rem`,
  }));
  if (!show) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: p.left,
            fontSize: p.size,
            animation: `confetti-drop ${p.duration} ${p.delay} ease-in forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function StarBadge({ lit, index }: Readonly<{ lit: boolean; index: number }>) {
  return (
    <span
      className="text-5xl transition-all duration-300"
      style={{
        opacity: lit ? 1 : 0.2,
        transform: lit ? "scale(1.3)" : "scale(0.9)",
        filter: lit ? "drop-shadow(0 0 10px #fbbf24)" : "none",
        transitionDelay: `${index * 0.4}s`,
      }}
    >
      ⭐
    </span>
  );
}

function getStarCount(correct: number, total: number) {
  const ratio = correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

function getRankLabel(stars: number) {
  if (stars === 3) return { label: "🏆 Xuất sắc!", color: "text-orange-500" };
  if (stars === 2) return { label: "🌟 Giỏi lắm!", color: "text-sky-600" };
  if (stars === 1)
    return { label: "👍 Cố gắng hơn nhé!", color: "text-purple-600" };
  return { label: "💪 Thử lại nhé bé!", color: "text-red-500" };
}

const RESULT_TO_LESSON: Record<string, string> = {
  "math2-b1": "math2-b1",
  "math2-b2": "math2-b2",
  "math2-b46": "math2-b46",
};

export function Math2ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeChild } = useActiveChild();
  const lessonId = location.pathname.split("/").pop();

  const state = location.state as LocationState | null;
  const correct = state?.correct ?? 0;
  const total = state?.total ?? 10;
  const stars = getStarCount(correct, total);
  const rank = getRankLabel(stars);

  const [litStars, setLitStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timers = [1, 2, 3].map((n, i) =>
      setTimeout(
        () => {
          if (n <= stars) setLitStars(n);
        },
        300 + i * 400,
      ),
    );
    if (stars >= 2) {
      timers.push(setTimeout(() => setShowConfetti(true), 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  useEffect(() => {
    if (!lessonId || stars < 1) return;
    const lid = RESULT_TO_LESSON[lessonId];
    if (lid && activeChild?.id) lessonService.markCompleted(activeChild.id, lid).catch(console.error);
  }, [lessonId, stars, activeChild?.id || ""]);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-100" />

      {["🌈", "☀️", "🎵", "💐"].map((e, i) => (
        <span
          key={i}
          className="absolute text-3xl pointer-events-none animate-float-slow opacity-50"
          style={{
            top: `${15 + i * 15}%`,
            left: i % 2 === 0 ? `${4 + i * 4}%` : `${88 - i * 4}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {e}
        </span>
      ))}

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-kids-bounce-in">
        <Confetti show={showConfetti} />

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-300 px-5 py-3 text-center">
          <p className="text-white text-sm font-extrabold">
            {lessonId === "math2-b1-t1"
              ? "📊 Bài 1 (Tiết 1): Đọc, viết, xếp thứ tự"
              : lessonId === "math2-b46"
                ? "📊 Bài 46: Khối trụ và Khối cầu"
                : "📊 Bài 2: Tia số · Số liền trước, số liền sau"}
          </p>
        </div>

        <div className="relative z-10 px-6 py-6 flex flex-col items-center gap-5 text-center">
          {/* Result emoji */}
          <div
            className="text-7xl"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" }}
          >
            {stars === 3
              ? "🏆"
              : stars === 2
                ? "🌟"
                : stars === 1
                  ? "😊"
                  : "😅"}
          </div>

          {/* Rank */}
          <div>
            <h2
              className={`text-3xl font-extrabold leading-tight ${rank.color}`}
            >
              {rank.label}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Bé trả lời đúng{" "}
              <strong className="text-gray-700">
                {correct}/{total}
              </strong>{" "}
              câu
            </p>
          </div>

          {/* Stars row */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((n) => (
              <StarBadge key={n} lit={litStars >= n} index={n - 1} />
            ))}
          </div>

          {/* Score breakdown */}
          <div className="w-full bg-gray-50 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold text-green-600">
                {correct}
              </p>
              <p className="text-xs text-gray-500 font-bold">Đúng</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-red-500">
                {total - correct}
              </p>
              <p className="text-xs text-gray-500 font-bold">Sai</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-purple-600">
                {total > 0 ? Math.round((correct / total) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 font-bold">Điểm</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => navigate("/student")}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-lg font-extrabold
                         rounded-2xl shadow-[0_5px_0_#c2550f] active:translate-y-[3px] active:shadow-none
                         transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Về mục lục
            </button>

            <button
              onClick={() => navigate(`/student/quiz/${lessonId}`)}
              className="w-full py-3 bg-white border-2 border-gray-200 text-gray-600 font-extrabold
                         rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} />
              Làm lại bài quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
