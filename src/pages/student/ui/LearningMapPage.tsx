import { useState } from "react";
import { CheckCircle2, Play, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LevelStatus = "done" | "active" | "locked";

interface Level {
  id: number;
  label: string;
  sublabel: string;
  status: LevelStatus;
  emoji: string;
  /** position on the winding path [left%, top%] */
  pos: [number, number];
}

const levels: Level[] = [
  {
    id: 1,
    label: "Bài 1",
    sublabel: "Khám phá khối Lập phương",
    status: "done",
    emoji: "📦",
    pos: [15, 72],
  },
  {
    id: 2,
    label: "Bài 2",
    sublabel: "Đếm các mặt của khối cầu",
    status: "done",
    emoji: "🔵",
    pos: [38, 52],
  },
  {
    id: 3,
    label: "Bài 3",
    sublabel: "Tìm hiểu hình trụ",
    status: "active",
    emoji: "🥤",
    pos: [60, 33],
  },
  {
    id: 4,
    label: "Bài 4",
    sublabel: "Xây tháp với khối chóp",
    status: "locked",
    emoji: "🔺",
    pos: [78, 55],
  },
  {
    id: 5,
    label: "Bài 5",
    sublabel: "Thử thách tổng hợp 3D",
    status: "locked",
    emoji: "🏆",
    pos: [88, 75],
  },
];

const pathD =
  "M 8,90 C 20,85 26,75 15,72 C 8,69 5,58 20,53 C 32,48 40,50 38,52 C 36,54 42,42 55,35 C 58,33 62,31 60,33 C 58,35 66,44 76,53 C 79,56 80,60 78,55 C 76,50 84,62 90,73";

const statusStyle: Record<
  LevelStatus,
  { ring: string; inner: string; shadow: string; size: string }
> = {
  done: {
    ring: "bg-green-400",
    inner: "bg-green-500",
    shadow: "shadow-[0_6px_0_#15803d]",
    size: "w-16 h-16",
  },
  active: {
    ring: "bg-yellow-300",
    inner: "bg-yellow-400",
    shadow: "shadow-[0_6px_0_#b45309]",
    size: "w-20 h-20",
  },
  locked: {
    ring: "bg-gray-300",
    inner: "bg-gray-400",
    shadow: "shadow-[0_4px_0_#6b7280]",
    size: "w-14 h-14",
  },
};

export function LearningMapPage() {
  const [tooltip, setTooltip] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleNode = (level: Level) => {
    if (level.status === "active") navigate("/student/lesson");
    if (level.status === "done") navigate("/student/lesson");
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] select-none overflow-hidden">
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-green-100" />

      {/* Decorative clouds */}
      {[
        { top: "8%", left: "5%", size: "text-5xl", delay: "0s" },
        { top: "12%", left: "55%", size: "text-6xl", delay: "1.5s" },
        { top: "22%", left: "78%", size: "text-4xl", delay: "3s" },
        { top: "5%", left: "32%", size: "text-3xl", delay: "2s" },
      ].map((c, i) => (
        <span
          key={i}
          className="absolute animate-float-slow text-white/80 pointer-events-none"
          style={{
            top: c.top,
            left: c.left,
            fontSize: c.size,
            animationDelay: c.delay,
          }}
        >
          ☁️
        </span>
      ))}

      {/* Winding path SVG */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* shadow path */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* main dashed path */}
        <path
          d={pathD}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="5 4"
          className="kids-path-draw"
        />
      </svg>

      {/* Level nodes */}
      {levels.map((lv) => {
        const s = statusStyle[lv.status];
        return (
          <div
            key={lv.id}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: `${lv.pos[0]}%`,
              top: `${lv.pos[1]}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            {/* Tooltip */}
            {tooltip === lv.id && (
              <div className="absolute -top-14 bg-white rounded-2xl shadow-xl px-4 py-2 text-xs font-extrabold text-gray-700 whitespace-nowrap z-20 animate-badge-pop">
                {lv.sublabel}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
              </div>
            )}

            {/* Node button */}
            <button
              onClick={() => handleNode(lv)}
              onMouseEnter={() => setTooltip(lv.id)}
              onMouseLeave={() => setTooltip(null)}
              disabled={lv.status === "locked"}
              className={`
                ${s.size} ${s.ring} ${s.shadow}
                rounded-full flex items-center justify-center
                transition-transform duration-150
                ${lv.status === "active" ? "animate-pulse-slow scale-110 cursor-pointer" : ""}
                ${lv.status === "done" ? "cursor-pointer hover:scale-110" : ""}
                ${lv.status === "locked" ? "cursor-not-allowed opacity-70" : ""}
                active:translate-y-[3px] active:shadow-none border-4 border-white
              `}
            >
              <div
                className={`${s.inner} w-3/4 h-3/4 rounded-full flex items-center justify-center`}
              >
                {lv.status === "done" && (
                  <CheckCircle2
                    size={22}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
                {lv.status === "active" && (
                  <Play
                    size={22}
                    className="text-white fill-white"
                    strokeWidth={0}
                  />
                )}
                {lv.status === "locked" && (
                  <Lock size={18} className="text-white" strokeWidth={2.5} />
                )}
              </div>
            </button>

            {/* Label */}
            <span
              className={`text-xs font-extrabold ${lv.status === "locked" ? "text-gray-400" : "text-gray-700"} bg-white/70 rounded-full px-2 py-0.5`}
            >
              {lv.emoji} {lv.label}
            </span>
          </div>
        );
      })}

      {/* Bottom grass strip */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-green-400/60 rounded-t-[50%]" />

      {/* Page title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-extrabold text-sky-700 drop-shadow">
          🗺️ Bản đồ phiêu lưu Toán học
        </h1>
      </div>
    </div>
  );
}
