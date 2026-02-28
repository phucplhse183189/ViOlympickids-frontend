import { useState } from "react";
import { RewardModal } from "./RewardModal";

const tips = [
  "Bé hãy xoay thử khối lập phương — có mấy mặt nhé! 🤔",
  "Mỗi mặt của khối lập phương là hình gì vậy bé? 😊",
  "Đếm to lên nào: 1, 2, 3... bé đếm được bao nhiêu mặt? 🔢",
];

export function InteractiveMathSpacePage() {
  const [showReward, setShowReward] = useState(false);
  const [tipIdx] = useState(0);
  const [rotateX, setRotateX] = useState(20);
  const [rotateY, setRotateY] = useState(-30);
  const [dragging, setDragging] = useState(false);
  const [last, setLast] = useState({ x: 0, y: 0 });

  /* ── mouse/touch drag to spin cube ── */
  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    setLast({ x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    setRotateY((r) => r + dx * 0.6);
    setRotateX((r) => r - dy * 0.6);
    setLast({ x: e.clientX, y: e.clientY });
  };
  const onUp = () => setDragging(false);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] bg-sky-100 overflow-hidden px-4 py-6">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-sky-700 mb-6 text-center drop-shadow">
        🧊 Khám phá khối Lập phương
      </h1>

      {/* 3D canvas frame */}
      <div
        className="relative w-full max-w-lg aspect-square md:aspect-[4/3] bg-white rounded-3xl shadow-2xl border-4 border-sky-200 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: 700 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {/* stars decoration */}
        {[
          "top-3 left-4",
          "top-5 right-6",
          "bottom-6 left-8",
          "bottom-4 right-5",
        ].map((cls, i) => (
          <span
            key={i}
            className={`absolute ${cls} text-lg pointer-events-none`}
            style={{
              animation: `star-light 2s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            ⭐
          </span>
        ))}

        {/* Spinning CSS cube */}
        <div
          className="w-36 h-36 md:w-48 md:h-48 relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          {[
            { t: "translateZ(72px)", bg: "bg-blue-400/80" },
            { t: "translateZ(-72px) rotateY(180deg)", bg: "bg-blue-500/80" },
            { t: "rotateY(90deg) translateZ(72px)", bg: "bg-sky-400/80" },
            { t: "rotateY(-90deg) translateZ(72px)", bg: "bg-sky-500/80" },
            { t: "rotateX(90deg) translateZ(72px)", bg: "bg-cyan-400/80" },
            { t: "rotateX(-90deg) translateZ(72px)", bg: "bg-cyan-500/80" },
          ].map((face, i) => (
            <div
              key={i}
              className={`absolute inset-0 ${face.bg} border-4 border-white/70 rounded-xl flex items-center justify-center text-white text-3xl font-extrabold`}
              style={{ transform: face.t, backfaceVisibility: "visible" }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* drag hint */}
        <p className="absolute bottom-3 text-xs text-gray-400 font-semibold">
          {" "}
          ↔ Kéo để xoay nào bé!
        </p>
      </div>

      {/* Robot + chat bubble */}
      <div className="flex items-end gap-3 mt-6 max-w-lg w-full">
        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center shadow-[0_5px_0_#c2550f] text-4xl select-none">
          🤖
        </div>
        <div className="relative bg-white rounded-3xl rounded-bl-none shadow-xl px-5 py-4 text-sm md:text-base font-bold text-gray-700 max-w-xs animate-badge-pop">
          {tips[tipIdx]}
          {/* tail */}
          <div
            className="absolute -left-3 bottom-4 w-4 h-4 bg-white"
            style={{ clipPath: "polygon(100% 0,100% 100%,0 100%)" }}
          />
        </div>
      </div>

      {/* Finish button */}
      <button
        onClick={() => setShowReward(true)}
        className="mt-8 px-10 py-4 bg-green-400 hover:bg-green-500 text-white text-xl font-extrabold rounded-full shadow-[0_6px_0_#15803d] active:translate-y-[3px] active:shadow-none transition-all animate-bounce"
      >
        🎯 Hoàn thành bài!
      </button>

      {/* Reward modal */}
      {showReward && <RewardModal onClose={() => setShowReward(false)} />}
    </div>
  );
}
