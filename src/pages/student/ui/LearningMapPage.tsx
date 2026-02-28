import { useState, useEffect } from "react";
import { CheckCircle2, Play, Lock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CHAPTERS,
  getCompletedLessons,
  getTotalXP,
  type Chapter,
  type Lesson,
} from "@/shared/api/studentMockData";

type LevelStatus = "done" | "active" | "locked";

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

function getLessonStatus(
  lesson: Lesson,
  completedIds: number[],
  allLessons: Lesson[],
): LevelStatus {
  if (completedIds.includes(lesson.id)) return "done";
  // find index of this lesson in the chapter
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  if (idx === 0) return "active"; // first lesson is always active
  const prevLesson = allLessons[idx - 1];
  if (completedIds.includes(prevLesson.id)) return "active";
  return "locked";
}

function ChapterTab({
  chapter,
  active,
  onClick,
}: {
  chapter: Chapter;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm transition-all
        ${
          active
            ? `${chapter.color} text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] scale-105`
            : "bg-white/70 text-gray-600 hover:bg-white border-2 border-white/50"
        }
      `}
    >
      <span className="text-lg">{chapter.emoji}</span>
      <span className="hidden sm:inline">{chapter.title}</span>
    </button>
  );
}

export function LearningMapPage() {
  const [tooltip, setTooltip] = useState<number | null>(null);
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setCompletedIds(getCompletedLessons());
    setTotalXP(getTotalXP());
  }, []);

  const chapter = CHAPTERS.find((c) => c.id === activeChapterId) ?? CHAPTERS[0];
  const lessons = chapter.lessons;

  const handleNode = (lesson: Lesson, status: LevelStatus) => {
    if (status === "locked") return;
    navigate(`/student/lesson/${lesson.id}`);
  };

  const doneCount = lessons.filter((l) => completedIds.includes(l.id)).length;

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] select-none overflow-hidden">
      {/* Sky gradient background */}
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
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="5"
          strokeLinecap="round"
        />
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
      {lessons.map((lesson) => {
        const status = getLessonStatus(lesson, completedIds, lessons);
        const s = statusStyle[status];
        return (
          <div
            key={lesson.id}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: `${lesson.pos[0]}%`,
              top: `${lesson.pos[1]}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            {/* Tooltip */}
            {tooltip === lesson.id && (
              <div className="absolute -top-14 bg-white rounded-2xl shadow-xl px-4 py-2 text-xs font-extrabold text-gray-700 whitespace-nowrap z-20 animate-badge-pop">
                {lesson.title}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
              </div>
            )}

            {/* Node button */}
            <button
              onClick={() => handleNode(lesson, status)}
              onMouseEnter={() => setTooltip(lesson.id)}
              onMouseLeave={() => setTooltip(null)}
              disabled={status === "locked"}
              className={`
                ${s.size} ${s.ring} ${s.shadow}
                rounded-full flex items-center justify-center
                transition-transform duration-150
                ${status === "active" ? "animate-pulse-slow scale-110 cursor-pointer" : ""}
                ${status === "done" ? "cursor-pointer hover:scale-110" : ""}
                ${status === "locked" ? "cursor-not-allowed opacity-70" : ""}
                active:translate-y-[3px] active:shadow-none border-4 border-white
              `}
            >
              <div
                className={`${s.inner} w-3/4 h-3/4 rounded-full flex items-center justify-center`}
              >
                {status === "done" && (
                  <CheckCircle2
                    size={22}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
                {status === "active" && (
                  <Play
                    size={22}
                    className="text-white fill-white"
                    strokeWidth={0}
                  />
                )}
                {status === "locked" && (
                  <Lock size={18} className="text-white" strokeWidth={2.5} />
                )}
              </div>
            </button>

            {/* Label */}
            <span
              className={`text-xs font-extrabold ${status === "locked" ? "text-gray-400" : "text-gray-700"} bg-white/70 rounded-full px-2 py-0.5`}
            >
              {lesson.emoji} Bài {lessons.indexOf(lesson) + 1}
            </span>
          </div>
        );
      })}

      {/* Bottom grass strip */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-green-400/60 rounded-t-[50%]" />

      {/* ── TOP UI ── */}
      <div className="absolute top-4 inset-x-0 flex flex-col items-center gap-3 pointer-events-none px-4">
        {/* Page title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-sky-700 drop-shadow text-center">
          🗺️ Bản đồ phiêu lưu Toán học
        </h1>

        {/* Progress bar */}
        <div className="pointer-events-none max-w-xs w-full">
          <div className="flex justify-between text-xs font-extrabold text-sky-700 mb-1">
            <span>
              {chapter.emoji} {chapter.title}
            </span>
            <span>
              {doneCount}/{lessons.length} bài
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden border-2 border-white">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / lessons.length) * 100}%` }}
            />
          </div>
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-1.5 bg-yellow-400 rounded-full px-4 py-1.5 shadow-[0_3px_0_#b45309] pointer-events-none">
          <Star size={14} className="text-white fill-white" />
          <span className="text-white font-extrabold text-sm">
            {totalXP} XP
          </span>
        </div>
      </div>

      {/* ── Chapter Tab Bar ── */}
      <div className="absolute bottom-14 inset-x-0 flex justify-center gap-2 px-4 z-10">
        {CHAPTERS.map((ch) => (
          <ChapterTab
            key={ch.id}
            chapter={ch}
            active={ch.id === activeChapterId}
            onClick={() => setActiveChapterId(ch.id)}
          />
        ))}
      </div>
    </div>
  );
}
