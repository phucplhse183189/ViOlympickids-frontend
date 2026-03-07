import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Star, Gamepad2, BookOpen, Crown, Sparkles } from "lucide-react";
import {
  CHAPTERS,
  getCompletedLessons,
  getCompletedGames,
  getTotalXP,
  getActiveChildPlan,
  isLessonAccessible,
  getAccessibleChapterIds,
  type Chapter,
  type Lesson,
} from "@/shared/api/studentMockData";
import { type PlanType } from "@/shared/api/dashboardMockData";

type SectionTab = "game" | "quiz";

const PLAN_BADGE: Record<
  PlanType,
  { label: string; color: string; icon: string }
> = {
  FREE: { label: "Miễn phí", color: "bg-gray-400", icon: "🆓" },
  PRO: { label: "PRO", color: "bg-blue-500", icon: "⭐" },
  VIP: {
    label: "VIP",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500",
    icon: "👑",
  },
};

const PLAN_UPGRADE: Record<PlanType, string | null> = {
  FREE: "Nâng cấp PRO để mở thêm bài học & game!",
  PRO: "Nâng cấp VIP để trải nghiệm trọn vẹn!",
  VIP: null,
};

function PlanBadge({ plan }: { plan: PlanType }) {
  const badge = PLAN_BADGE[plan];
  return (
    <span
      className={`${badge.color} text-white text-xs font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1`}
    >
      {badge.icon} {badge.label}
    </span>
  );
}

function LessonCard({
  lesson,
  chapter,
  type,
  isDone,
  isAccessible,
  onClick,
}: {
  lesson: Lesson;
  chapter: Chapter;
  type: SectionTab;
  isDone: boolean;
  isAccessible: boolean;
  onClick: () => void;
}) {
  const gameCount = lesson.games.length;
  const quizCount = lesson.questions.length;

  return (
    <button
      onClick={isAccessible ? onClick : undefined}
      disabled={!isAccessible}
      className={`
        relative w-full rounded-3xl p-4 text-left transition-all duration-200 border-3 overflow-hidden
        ${
          isAccessible
            ? isDone
              ? "bg-green-50 border-green-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              : "bg-white border-gray-200 hover:scale-[1.02] hover:shadow-lg hover:border-orange-300 cursor-pointer"
            : "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
        }
      `}
    >
      {/* Lock overlay */}
      {!isAccessible && (
        <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center rounded-3xl z-10">
          <div className="bg-white rounded-2xl p-3 shadow-lg flex flex-col items-center gap-1">
            <Lock size={20} className="text-gray-400" />
            <span className="text-[10px] font-extrabold text-gray-400">
              Nâng cấp
            </span>
          </div>
        </div>
      )}

      {/* Done badge */}
      {isDone && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
          ✅ Xong
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Emoji icon */}
        <div
          className={`w-12 h-12 rounded-2xl ${chapter.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}
        >
          {lesson.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-800 text-sm leading-tight truncate">
            {lesson.title}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
            {lesson.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              ⭐ +{lesson.xpReward} XP
            </span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              {type === "game" ? `🎮 ${gameCount} game` : `📝 ${quizCount} câu`}
            </span>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
              ⏱ {lesson.duration}p
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ChapterSection({
  chapter,
  tab,
  plan,
  completedQuizIds,
  completedGameIds,
  onPlay,
}: {
  chapter: Chapter;
  tab: SectionTab;
  plan: PlanType;
  completedQuizIds: number[];
  completedGameIds: number[];
  onPlay: (lessonId: number, type: SectionTab) => void;
}) {
  const chapterAccessible = getAccessibleChapterIds(plan).includes(chapter.id);

  return (
    <div className="mb-6">
      {/* Chapter header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className={`w-8 h-8 rounded-xl ${chapter.color} flex items-center justify-center text-lg`}
        >
          {chapter.emoji}
        </span>
        <div className="flex-1">
          <h2 className="font-extrabold text-gray-800 text-base">
            {chapter.title}
          </h2>
          <p className="text-[11px] text-gray-500">{chapter.description}</p>
        </div>
        {!chapterAccessible && (
          <span className="text-[10px] font-extrabold text-orange-500 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
            <Crown size={12} /> Nâng cấp
          </span>
        )}
      </div>

      {/* Lesson cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {chapter.lessons.map((lesson) => {
          const accessible = isLessonAccessible(lesson.id, plan);
          const isDone =
            tab === "game"
              ? completedGameIds.includes(lesson.id)
              : completedQuizIds.includes(lesson.id);

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              chapter={chapter}
              type={tab}
              isDone={isDone}
              isAccessible={accessible}
              onClick={() => onPlay(lesson.id, tab)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function StudentHomePage() {
  const [activeTab, setActiveTab] = useState<SectionTab>("game");
  const [completedQuizIds, setCompletedQuizIds] = useState<number[]>([]);
  const [completedGameIds, setCompletedGameIds] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const navigate = useNavigate();

  const plan = getActiveChildPlan();

  useEffect(() => {
    setCompletedQuizIds(getCompletedLessons());
    setCompletedGameIds(getCompletedGames());
    setTotalXP(getTotalXP());
  }, []);

  const handlePlay = (lessonId: number, type: SectionTab) => {
    if (type === "game") {
      navigate(`/student/game/${lessonId}`);
    } else {
      navigate(`/student/lesson/${lessonId}`);
    }
  };

  const upgradeMessage = PLAN_UPGRADE[plan];

  // Count totals
  const accessibleChapters = getAccessibleChapterIds(plan);
  const totalGames = CHAPTERS.filter((c) => accessibleChapters.includes(c.id))
    .flatMap((c) => c.lessons)
    .filter((l) => isLessonAccessible(l.id, plan)).length;
  const doneGames = completedGameIds.length;
  const doneQuizzes = completedQuizIds.length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Plan & XP row */}
          <div className="flex items-center justify-between mb-4">
            <PlanBadge plan={plan} />
            <div className="flex items-center gap-1.5 bg-yellow-400 rounded-full px-4 py-1.5 shadow-[0_3px_0_#b45309]">
              <Star size={14} className="text-white fill-white" />
              <span className="text-white font-extrabold text-sm">
                {totalXP} XP
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            🏠 Phòng học của bé
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Chọn hoạt động yêu thích để bắt đầu nào!
          </p>

          {/* Tab switcher */}
          <div className="flex gap-2 p-1 bg-white/80 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("game")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all ${
                activeTab === "game"
                  ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Gamepad2 size={18} />
              <span>🎮 Trò chơi</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "game" ? "bg-white/20" : "bg-gray-200"
                }`}
              >
                {doneGames}/{totalGames}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all ${
                activeTab === "quiz"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <BookOpen size={18} />
              <span>📝 Bài kiểm tra</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === "quiz" ? "bg-white/20" : "bg-gray-200"
                }`}
              >
                {doneQuizzes}/{totalGames}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade banner */}
      {upgradeMessage && (
        <div className="px-4 mb-3">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Sparkles size={20} className="text-orange-400 flex-shrink-0" />
            <p className="text-sm font-bold text-orange-700 flex-1">
              {upgradeMessage}
            </p>
            <button
              onClick={() => navigate("/dashboard/subscription")}
              className="bg-orange-400 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl hover:bg-orange-500 transition-colors flex-shrink-0"
            >
              Nâng cấp
            </button>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Section description */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            {activeTab === "game" ? (
              <>
                <span className="text-2xl">🎮</span>
                <div>
                  <h2 className="font-extrabold text-gray-800">
                    Khu vực Trò chơi
                  </h2>
                  <p className="text-xs text-gray-500">
                    Học qua game tương tác vui nhộn!
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl">📝</span>
                <div>
                  <h2 className="font-extrabold text-gray-800">
                    Khu vực Kiểm tra
                  </h2>
                  <p className="text-xs text-gray-500">
                    Làm bài quiz để kiểm tra kiến thức!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Chapters */}
          {CHAPTERS.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              tab={activeTab}
              plan={plan}
              completedQuizIds={completedQuizIds}
              completedGameIds={completedGameIds}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
