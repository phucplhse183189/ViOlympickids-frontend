import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, BookOpen } from "lucide-react";
import {
  getLessonById,
  getChapterByLessonId,
  getCompletedLessons,
} from "@/shared/api/studentMockData";

const robotTips: Record<number, string[]> = {
  1: [
    "📦 Hãy nghĩ về các hộp đồ vật xung quanh bé!",
    "Khối lập phương có 6 mặt giống nhau đó! 😊",
  ],
  2: [
    "⚽ Nhìn quả bóng — đó là khối cầu!",
    "Bề mặt cong hoàn toàn, không có góc! 🌟",
  ],
  3: [
    "🥤 Lon nước ngọt là hình trụ đấy bé!",
    "Hình trụ có 2 mặt tròn và 1 mặt cong! 💡",
  ],
  4: [
    "🏛️ Kim tự tháp là khối chóp tứ giác!",
    "Có đỉnh nhọn trên cùng là đặc điểm nổi bật! ⛰️",
  ],
  5: [
    "🎓 Bé đã học nhiều hình 3D rồi!",
    "Đây là bài thử thách tổng hợp — cố lên! 🏆",
  ],
};

export function LessonIntroPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lessonId = Number(id);
  const lesson = getLessonById(lessonId);
  const chapter = getChapterByLessonId(lessonId);
  const completedIds = getCompletedLessons();
  const isAlreadyDone = completedIds.includes(lessonId);

  if (!lesson || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-xl font-extrabold text-gray-600">
          Không tìm thấy bài học!
        </p>
        <button
          onClick={() => navigate("/student")}
          className="px-6 py-3 bg-orange-400 text-white font-extrabold rounded-2xl"
        >
          ← Quay lại bản đồ
        </button>
      </div>
    );
  }

  const lessonIndex = chapter.lessons.findIndex((l) => l.id === lessonId) + 1;
  const tipLines = robotTips[lessonIndex] ?? [
    "Hãy chuẩn bị tốt và bắt đầu nhé! 😊",
    "Bé làm được thôi! 🌟",
  ];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-100" />

      {/* Floating decorations */}
      {["⭐", "✨", "🌟", "💫"].map((s, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-2xl animate-float-slow opacity-60"
          style={{
            top: `${15 + i * 18}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : `${85 - i * 3}%`,
            animationDelay: `${i * 0.8}s`,
          }}
        >
          {s}
        </span>
      ))}

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-kids-bounce-in">
        {/* Header band */}
        <div
          className={`${chapter.color} px-6 py-5 flex items-center justify-between`}
        >
          <button
            onClick={() => navigate("/student")}
            className="flex items-center gap-1 text-white font-extrabold text-sm hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={18} strokeWidth={3} />
            <span>Trang chủ</span>
          </button>
          <span className="text-white font-extrabold text-sm">
            {chapter.emoji} {chapter.title} · Bài {lessonIndex}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-5 text-center">
          {/* Lesson emoji / icon */}
          <div
            className="w-24 h-24 rounded-full bg-yellow-50 border-4 border-yellow-300 flex items-center justify-center text-5xl shadow-lg"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
          >
            {lesson.emoji}
          </div>

          {/* Done badge */}
          {isAlreadyDone && (
            <span className="bg-green-100 text-green-700 text-xs font-extrabold px-3 py-1 rounded-full border border-green-300">
              ✅ Đã hoàn thành — Chơi lại!
            </span>
          )}

          {/* Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{lesson.description}</p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 w-full justify-center">
            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-2">
              <Star size={16} className="text-yellow-500 fill-yellow-400" />
              <span className="font-extrabold text-yellow-700 text-sm">
                +{lesson.xpReward} XP
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-2">
              <Clock size={16} className="text-sky-500" />
              <span className="font-extrabold text-sky-700 text-sm">
                ~{lesson.duration} phút
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-2">
              <BookOpen size={16} className="text-purple-500" />
              <span className="font-extrabold text-purple-700 text-sm">
                {lesson.questions.length} câu
              </span>
            </div>
          </div>

          {/* Robot tip */}
          <div className="flex items-end gap-3 w-full bg-sky-50 rounded-2xl p-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-md">
              🤖
            </div>
            <div className="flex flex-col gap-1 text-left">
              {tipLines.map((tip, i) => (
                <p key={i} className="text-sm font-bold text-gray-700">
                  {tip}
                </p>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={() => navigate(`/student/exercise/${lessonId}`)}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xl font-extrabold rounded-2xl shadow-[0_6px_0_#c2550f] active:translate-y-[3px] active:shadow-none transition-all hover:from-orange-500 hover:to-orange-600"
          >
            {isAlreadyDone ? "🔁 Chơi lại!" : "🚀 Bắt đầu!"}
          </button>
        </div>
      </div>
    </div>
  );
}
