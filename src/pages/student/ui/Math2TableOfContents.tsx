import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Lock, ArrowRight } from "lucide-react";
import { MATH2_TOPICS, type Math2Lesson, type Math2Topic } from "@/shared/api/math2Data";

// ─── Thẻ bài học ──────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  topic,
  onPlay,
}: Readonly<{
  lesson: Math2Lesson;
  topic: Math2Topic;
  onPlay: (lesson: Math2Lesson) => void;
}>) {
  const hasGame = lesson.gameType !== null;

  return (
    <button
      onClick={() => onPlay(lesson)}
      className={`
        group relative w-full text-left rounded-3xl p-4 sm:p-5
        transition-all duration-200 border-3
        ${
          hasGame
            ? "bg-white border-emerald-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1 cursor-pointer"
            : "bg-white/70 border-gray-200 cursor-default opacity-80"
        }
      `}
    >
      {/* Badge số bài */}
      <div
        className={`
          absolute -top-3 -left-2 w-10 h-10 rounded-full flex items-center justify-center
          text-white font-extrabold text-sm shadow-md
          bg-gradient-to-br ${topic.color}
        `}
      >
        {lesson.lessonNumber}
      </div>

      {/* Nội dung */}
      <div className="ml-6">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{lesson.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-gray-800 text-base sm:text-lg leading-tight">
              Bài {lesson.lessonNumber}: {lesson.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
              {lesson.description}
            </p>
          </div>
        </div>

        {/* Tag game */}
        <div className="mt-3 flex items-center gap-2">
          {hasGame ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles size={12} />
              Chơi ngay
              <ArrowRight size={12} />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
              <Lock size={12} />
              Sắp ra mắt
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Nhóm chủ đề ─────────────────────────────────────────────────────────────

function TopicSection({
  topic,
  onPlay,
}: Readonly<{
  topic: Math2Topic;
  onPlay: (lesson: Math2Lesson) => void;
}>) {
  return (
    <section className="animate-fade-in-up">
      {/* Header chủ đề */}
      <div
        className={`
          flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl
          bg-gradient-to-r ${topic.color} shadow-md
        `}
      >
        <span className="text-3xl">{topic.emoji}</span>
        <div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
            Chủ đề {topic.topicNumber}
          </p>
          <h2 className="text-white font-extrabold text-lg sm:text-xl">
            {topic.title}
          </h2>
        </div>
      </div>

      {/* Grid bài học */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pl-2">
        {topic.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            topic={topic}
            onPlay={onPlay}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Trang Mục lục chính ──────────────────────────────────────────────────────

export function Math2TableOfContents() {
  const navigate = useNavigate();
  const handlePlay = (lesson: Math2Lesson) => {
    if (lesson.gameType === null) return;

    // Định tuyến đến game dựa trên gameType
    if (lesson.gameType === "number-sequence-chart") {
      navigate(`/student/game/number-sequence`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-amber-50 via-sky-50 to-emerald-50">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-5 py-2 shadow-sm mb-3">
          <BookOpen size={18} className="text-amber-500" />
          <span className="text-sm font-bold text-gray-500">
            Kết nối tri thức – Tập 1
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
          📐 Toán Lớp 2
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Chọn bài học để bắt đầu phiêu lưu toán học nào! 🚀
        </p>
      </div>

      {/* Danh sách chủ đề */}
      <div className="max-w-5xl mx-auto px-4 pb-10 space-y-8">
        {MATH2_TOPICS.map((topic) => (
          <TopicSection key={topic.id} topic={topic} onPlay={handlePlay} />
        ))}
      </div>

      {/* Decorative bottom */}
      <div className="h-6 bg-gradient-to-r from-amber-200 via-sky-200 to-emerald-200 rounded-t-[50%]" />
    </div>
  );
}
