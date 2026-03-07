// ─── Toán Lớp 2 – Kết nối tri thức (Tập 1) ─────────────────────────────────
// Cấu trúc dữ liệu mô phỏng Mục lục Toán 2

/**
 * gameType quyết định component game nào sẽ mở khi click vào bài học.
 * - "number-sequence-chart": Game biểu đồ dãy số (Bài 2)
 * - null: chưa có game (hiển thị "Sắp ra mắt")
 */
export type GameType = "number-sequence-chart" | null;

export interface Math2Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  gameType: GameType;
  emoji: string;
  description: string;
}

export interface Math2Topic {
  id: string;
  topicNumber: number;
  title: string;
  color: string; // tailwind gradient classes
  accent: string; // tailwind text color
  emoji: string;
  lessons: Math2Lesson[];
}

// ─── Dữ liệu Mục lục ────────────────────────────────────────────────────────

export const MATH2_TOPICS: Math2Topic[] = [
  {
    id: "topic-1",
    topicNumber: 1,
    title: "Ôn tập và bổ sung",
    color: "from-orange-400 to-amber-300",
    accent: "text-orange-700",
    emoji: "📖",
    lessons: [
      {
        id: "math2-b1",
        lessonNumber: 1,
        title: "Ôn tập các số đến 100",
        gameType: null,
        emoji: "🔢",
        description: "Ôn lại các số từ 0 đến 100, đọc và viết số.",
      },
      {
        id: "math2-b2",
        lessonNumber: 2,
        title: "Tia số. Số liền trước, số liền sau",
        gameType: "number-sequence-chart",
        emoji: "📊",
        description: "Tìm quy luật dãy số và điền số còn thiếu trên biểu đồ cột.",
      },
      {
        id: "math2-b3",
        lessonNumber: 3,
        title: "Các thành phần của phép cộng, phép trừ",
        gameType: null,
        emoji: "➕",
        description: "Nhận biết số hạng, tổng, số bị trừ, số trừ, hiệu.",
      },
      {
        id: "math2-b4",
        lessonNumber: 4,
        title: "Hơn, kém nhau bao nhiêu",
        gameType: null,
        emoji: "⚖️",
        description: "So sánh hai số và tìm xem hơn/kém nhau bao nhiêu đơn vị.",
      },
      {
        id: "math2-b5",
        lessonNumber: 5,
        title: "Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100",
        gameType: null,
        emoji: "🧮",
        description: "Luyện tập phép cộng, trừ không nhớ với các số đến 100.",
      },
      {
        id: "math2-b6",
        lessonNumber: 6,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 1.",
      },
    ],
  },
  {
    id: "topic-2",
    topicNumber: 2,
    title: "Phép cộng, phép trừ qua 10 trong phạm vi 20",
    color: "from-sky-400 to-cyan-300",
    accent: "text-sky-700",
    emoji: "🚀",
    lessons: [
      {
        id: "math2-b7",
        lessonNumber: 7,
        title: "Phép cộng (qua 10) trong phạm vi 20",
        gameType: null,
        emoji: "🌟",
        description: "Tìm hiểu cách cộng qua 10 (VD: 8 + 5 = 13).",
      },
      {
        id: "math2-b8",
        lessonNumber: 8,
        title: "Bảng cộng (qua 10)",
        gameType: null,
        emoji: "📋",
        description: "Học thuộc bảng cộng qua 10 trong phạm vi 20.",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMath2LessonById(id: string): Math2Lesson | undefined {
  for (const topic of MATH2_TOPICS) {
    const lesson = topic.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getMath2TopicByLessonId(lessonId: string): Math2Topic | undefined {
  return MATH2_TOPICS.find((t) => t.lessons.some((l) => l.id === lessonId));
}
