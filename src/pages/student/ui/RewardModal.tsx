import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}

const confettiItems = ["🎉", "⭐", "🌟", "🎊", "💫", "✨", "🎈", "🏅"];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.2 + Math.random() * 1.2}s`,
    emoji: confettiItems[i % confettiItems.length],
    size: `${1 + Math.random()}rem`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
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

export function RewardModal({ onClose }: Props) {
  const [stars, setStars] = useState(0);

  /* light up stars one-by-one */
  useEffect(() => {
    const timers = [
      setTimeout(() => setStars(1), 400),
      setTimeout(() => setStars(2), 800),
      setTimeout(() => setStars(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center overflow-hidden animate-kids-bounce-in">
        <Confetti />

        {/* Trophy */}
        <div
          className="text-7xl mb-4"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
        >
          🏆
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-extrabold text-orange-500 drop-shadow leading-tight mb-1">
          Hoan hô!
        </h2>
        <p className="text-xl font-extrabold text-gray-700 mb-5">
          Bé làm đúng rồi! 🎉
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="text-5xl transition-all duration-200"
              style={{
                opacity: stars >= n ? 1 : 0.2,
                transform: stars >= n ? "scale(1.25)" : "scale(0.9)",
                filter: stars >= n ? "drop-shadow(0 0 8px #fbbf24)" : "none",
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* XP label */}
        <div className="bg-yellow-100 rounded-2xl px-5 py-3 mb-6 inline-block">
          <span className="text-lg font-extrabold text-yellow-700">
            +10 ⭐ điểm thưởng!
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white text-xl font-extrabold rounded-full shadow-[0_5px_0_#b45309] active:translate-y-[3px] active:shadow-none transition-all"
        >
          Nhận +10 ⭐
        </button>
      </div>
    </div>
  );
}
