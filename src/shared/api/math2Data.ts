// ─── Toán Lớp 2 – Kết nối tri thức (Tập 1) ─────────────────────────────────
// Cấu trúc dữ liệu mô phỏng Mục lục Toán 2

import {
  type PlanType,
  loadChildProfiles,
  ACTIVE_CHILD_ID_KEY,
} from "@/shared/api/dashboardMockData";

/**
 * gameType quyết định component game nào sẽ mở khi click vào bài học.
 * - "number-sequence-chart": Bài 2 — lý thuyết /student/theory/math2-b2 rồi game dãy số
 * - "add-across-ten-game": Phép cộng qua 10 trong phạm vi 20 (Bài 7)
 * - "pipe-balance-game": Ghép biểu thức cộng/trừ cùng giá trị — kiểu “nối ống cân bằng” (Bài 5)
 * - null: chưa có game (hiển thị "Sắp ra mắt")
 */
export type GameType =
  | "number-sequence-chart"
  | "number-review-game"
  | "add-across-ten-game"
  | "pipe-balance-game"
  | null;

export interface Math2Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  gameType: GameType;
  emoji: string;
  description: string;
  /** Minimum plan required to access this lesson */
  requiredPlan: PlanType;
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
        title: "Bài 1: Ôn tập các số đến 100",
        gameType: "number-review-game",
        emoji: "🔢",
        description: "Ôn tập cấu tạo số, đọc, viết và so sánh các số đến 100.",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b2",
        lessonNumber: 2,
        title: "Tia số. Số liền trước, số liền sau",
        gameType: "number-sequence-chart",
        emoji: "📊",
        description:
          "Tìm quy luật dãy số và điền số còn thiếu trên biểu đồ cột.",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b3",
        lessonNumber: 3,
        title: "Các thành phần của phép cộng, phép trừ",
        gameType: null,
        emoji: "➕",
        description: "Nhận biết số hạng, tổng, số bị trừ, số trừ, hiệu.",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b4",
        lessonNumber: 4,
        title: "Hơn, kém nhau bao nhiêu",
        gameType: null,
        emoji: "⚖️",
        description: "So sánh hai số và tìm xem hơn/kém nhau bao nhiêu đơn vị.",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b5",
        lessonNumber: 5,
        title: "Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100",
        gameType: "pipe-balance-game",
        emoji: "🧮",
        description:
          "Luyện tập phép cộng, trừ không nhớ — game nối ống: ghép hai biểu thức bằng nhau.",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b6",
        lessonNumber: 6,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 1.",
        requiredPlan: "FREE",
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
        gameType: "add-across-ten-game",
        emoji: "🌟",
        description: "Tìm hiểu cách cộng qua 10 (VD: 8 + 5 = 13).",
        requiredPlan: "FREE",
      },
      {
        id: "math2-b8",
        lessonNumber: 8,
        title: "Bảng cộng (qua 10)",
        gameType: null,
        emoji: "📋",
        description: "Học thuộc bảng cộng qua 10 trong phạm vi 20.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b9",
        lessonNumber: 9,
        title: "Bài toán về thêm, bớt một số đơn vị",
        gameType: null,
        emoji: "🎯",
        description: "Giải bài toán có lời văn dạng thêm, bớt một số đơn vị.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b10",
        lessonNumber: 10,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description:
          "Luyện tập tổng hợp phép cộng, trừ qua 10 trong phạm vi 20.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b11",
        lessonNumber: 11,
        title: "Phép trừ (qua 10) trong phạm vi 20",
        gameType: null,
        emoji: "➖",
        description: "Tìm hiểu cách trừ qua 10 (VD: 13 - 5 = 8).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b12",
        lessonNumber: 12,
        title: "Bảng trừ (qua 10)",
        gameType: null,
        emoji: "📋",
        description: "Học thuộc bảng trừ qua 10 trong phạm vi 20.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b13",
        lessonNumber: 13,
        title: "Bài toán về nhiều hơn, ít hơn một số đơn vị",
        gameType: null,
        emoji: "📝",
        description: "Giải bài toán có lời văn dạng nhiều hơn, ít hơn.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b14",
        lessonNumber: 14,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 2.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-3",
    topicNumber: 3,
    title: "Làm quen với khối lượng, dung tích",
    color: "from-emerald-400 to-green-300",
    accent: "text-emerald-700",
    emoji: "⚖️",
    lessons: [
      {
        id: "math2-b15",
        lessonNumber: 15,
        title: "Ki-lô-gam",
        gameType: null,
        emoji: "🏷️",
        description: "Làm quen với đơn vị đo khối lượng ki-lô-gam (kg).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b16",
        lessonNumber: 16,
        title: "Lít",
        gameType: null,
        emoji: "🥛",
        description: "Làm quen với đơn vị đo dung tích lít (l).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b17",
        lessonNumber: 17,
        title: "Thực hành và trải nghiệm với các đơn vị ki-lô-gam, lít",
        gameType: null,
        emoji: "🔬",
        description: "Thực hành cân, đo với đơn vị kg và lít.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b18",
        lessonNumber: 18,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 3.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-4",
    topicNumber: 4,
    title: "Phép cộng, phép trừ (có nhớ) trong phạm vi 100",
    color: "from-violet-400 to-purple-300",
    accent: "text-violet-700",
    emoji: "🧠",
    lessons: [
      {
        id: "math2-b19",
        lessonNumber: 19,
        title: "Phép cộng (có nhớ) số có hai chữ số với số có một chữ số",
        gameType: null,
        emoji: "🔢",
        description: "Cộng có nhớ dạng hai chữ số + một chữ số (VD: 27 + 5).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b20",
        lessonNumber: 20,
        title: "Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số",
        gameType: null,
        emoji: "➕",
        description: "Cộng có nhớ dạng hai chữ số + hai chữ số (VD: 38 + 25).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b21",
        lessonNumber: 21,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Luyện tập phép cộng có nhớ trong phạm vi 100.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b22",
        lessonNumber: 22,
        title: "Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số",
        gameType: null,
        emoji: "➖",
        description: "Trừ có nhớ dạng hai chữ số − một chữ số (VD: 43 − 7).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b23",
        lessonNumber: 23,
        title: "Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số",
        gameType: null,
        emoji: "➖",
        description: "Trừ có nhớ dạng hai chữ số − hai chữ số (VD: 52 − 28).",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b24",
        lessonNumber: 24,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 4.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-5",
    topicNumber: 5,
    title: "Làm quen với hình phẳng",
    color: "from-pink-400 to-rose-300",
    accent: "text-pink-700",
    emoji: "📐",
    lessons: [
      {
        id: "math2-b25",
        lessonNumber: 25,
        title: "Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng",
        gameType: null,
        emoji: "📏",
        description: "Nhận biết điểm, đoạn thẳng, đường thẳng, đường cong.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b26",
        lessonNumber: 26,
        title: "Đường gấp khúc. Hình tứ giác",
        gameType: null,
        emoji: "🔶",
        description: "Nhận biết đường gấp khúc và hình tứ giác.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b27",
        lessonNumber: 27,
        title: "Thực hành gấp, cắt, ghép, xếp hình. Vẽ đoạn thẳng",
        gameType: null,
        emoji: "✂️",
        description: "Thực hành gấp, cắt, ghép hình và vẽ đoạn thẳng.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b28",
        lessonNumber: 28,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 5.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-6",
    topicNumber: 6,
    title: "Ngày – giờ, giờ – phút, ngày – tháng",
    color: "from-amber-400 to-yellow-300",
    accent: "text-amber-700",
    emoji: "🕐",
    lessons: [
      {
        id: "math2-b29",
        lessonNumber: 29,
        title: "Ngày – giờ, giờ – phút",
        gameType: null,
        emoji: "⏰",
        description: "Làm quen với đơn vị thời gian: ngày, giờ, phút.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b30",
        lessonNumber: 30,
        title: "Ngày – tháng",
        gameType: null,
        emoji: "📅",
        description: "Tìm hiểu ngày trong tháng, xem lịch.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b31",
        lessonNumber: 31,
        title: "Thực hành và trải nghiệm xem đồng hồ, xem lịch",
        gameType: null,
        emoji: "🔬",
        description: "Thực hành đọc giờ trên đồng hồ và xem lịch.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b32",
        lessonNumber: 32,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập của chủ đề 6.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-7",
    topicNumber: 7,
    title: "Ôn tập học kì 1",
    color: "from-red-400 to-orange-300",
    accent: "text-red-700",
    emoji: "🎓",
    lessons: [
      {
        id: "math2-b33",
        lessonNumber: 33,
        title: "Ôn tập phép cộng, phép trừ trong phạm vi 20, 100",
        gameType: null,
        emoji: "🔢",
        description: "Ôn lại phép cộng, trừ trong phạm vi 20 và 100.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b34",
        lessonNumber: 34,
        title: "Ôn tập hình phẳng",
        gameType: null,
        emoji: "📐",
        description: "Ôn lại các kiến thức về hình phẳng.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b35",
        lessonNumber: 35,
        title: "Ôn tập đo lường",
        gameType: null,
        emoji: "📏",
        description: "Ôn lại các đơn vị đo lường: kg, lít, giờ, phút.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b36",
        lessonNumber: 36,
        title: "Ôn tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp ôn tập toàn bộ học kì 1.",
        requiredPlan: "PRO",
      },
    ],
  },
  // ─── TẬP 2 ──────────────────────────────────────────────────────────────────
  {
    id: "topic-8",
    topicNumber: 8,
    title: "Phép nhân, phép chia",
    color: "from-teal-400 to-emerald-300",
    accent: "text-teal-700",
    emoji: "✖️",
    lessons: [
      {
        id: "math2-b37",
        lessonNumber: 37,
        title: "Phép nhân",
        gameType: null,
        emoji: "✖️",
        description: "Làm quen với phép nhân, ý nghĩa của phép nhân.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b38",
        lessonNumber: 38,
        title: "Thừa số, tích",
        gameType: null,
        emoji: "🔢",
        description: "Nhận biết thừa số và tích trong phép nhân.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b39",
        lessonNumber: 39,
        title: "Bảng nhân 2",
        gameType: null,
        emoji: "2️⃣",
        description: "Học thuộc bảng nhân 2.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b40",
        lessonNumber: 40,
        title: "Bảng nhân 5",
        gameType: null,
        emoji: "5️⃣",
        description: "Học thuộc bảng nhân 5.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b41",
        lessonNumber: 41,
        title: "Phép chia",
        gameType: null,
        emoji: "➗",
        description: "Làm quen với phép chia, ý nghĩa của phép chia.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b42",
        lessonNumber: 42,
        title: "Số bị chia, số chia, thương",
        gameType: null,
        emoji: "🔢",
        description: "Nhận biết số bị chia, số chia và thương.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b43",
        lessonNumber: 43,
        title: "Bảng chia 2",
        gameType: null,
        emoji: "2️⃣",
        description: "Học thuộc bảng chia 2.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b44",
        lessonNumber: 44,
        title: "Bảng chia 5",
        gameType: null,
        emoji: "5️⃣",
        description: "Học thuộc bảng chia 5.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b45",
        lessonNumber: 45,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập phép nhân, phép chia.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-9",
    topicNumber: 9,
    title: "Làm quen với hình khối",
    color: "from-indigo-400 to-blue-300",
    accent: "text-indigo-700",
    emoji: "🧊",
    lessons: [
      {
        id: "math2-b46",
        lessonNumber: 46,
        title: "Khối trụ, khối cầu",
        gameType: null,
        emoji: "🏀",
        description: "Nhận biết khối trụ và khối cầu trong thực tế.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b47",
        lessonNumber: 47,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập về hình khối.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-10",
    topicNumber: 10,
    title: "Các số trong phạm vi 1 000",
    color: "from-cyan-400 to-sky-300",
    accent: "text-cyan-700",
    emoji: "🔟",
    lessons: [
      {
        id: "math2-b48",
        lessonNumber: 48,
        title: "Đơn vị, chục, trăm, nghìn",
        gameType: null,
        emoji: "🔢",
        description: "Nhận biết hàng đơn vị, chục, trăm, nghìn.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b49",
        lessonNumber: 49,
        title: "Các số tròn trăm, tròn chục",
        gameType: null,
        emoji: "💯",
        description: "Nhận biết và đọc viết các số tròn trăm, tròn chục.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b50",
        lessonNumber: 50,
        title: "So sánh các số tròn trăm, tròn chục",
        gameType: null,
        emoji: "⚖️",
        description: "So sánh các số tròn trăm, tròn chục.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b51",
        lessonNumber: 51,
        title: "Số có ba chữ số",
        gameType: null,
        emoji: "🔢",
        description: "Đọc, viết và phân tích số có ba chữ số.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b52",
        lessonNumber: 52,
        title: "Viết số thành tổng các trăm, chục, đơn vị",
        gameType: null,
        emoji: "📝",
        description: "Phân tích số thành tổng các trăm, chục, đơn vị.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b53",
        lessonNumber: 53,
        title: "So sánh các số có ba chữ số",
        gameType: null,
        emoji: "⚖️",
        description: "So sánh các số có ba chữ số.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b54",
        lessonNumber: 54,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập về số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-11",
    topicNumber: 11,
    title: "Độ dài và đơn vị đo độ dài. Tiền Việt Nam",
    color: "from-lime-400 to-green-300",
    accent: "text-lime-700",
    emoji: "📏",
    lessons: [
      {
        id: "math2-b55",
        lessonNumber: 55,
        title: "Đề-xi-mét. Mét. Ki-lô-mét",
        gameType: null,
        emoji: "📐",
        description: "Làm quen các đơn vị đo độ dài: dm, m, km.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b56",
        lessonNumber: 56,
        title: "Giới thiệu tiền Việt Nam",
        gameType: null,
        emoji: "💰",
        description: "Nhận biết các tờ tiền Việt Nam thông dụng.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b57",
        lessonNumber: 57,
        title: "Thực hành và trải nghiệm đo độ dài",
        gameType: null,
        emoji: "🔬",
        description: "Thực hành đo chiều dài bằng các đơn vị dm, m.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b58",
        lessonNumber: 58,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp các dạng bài tập về độ dài và tiền.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-12",
    topicNumber: 12,
    title: "Phép cộng, phép trừ trong phạm vi 1 000",
    color: "from-fuchsia-400 to-pink-300",
    accent: "text-fuchsia-700",
    emoji: "🚀",
    lessons: [
      {
        id: "math2-b59",
        lessonNumber: 59,
        title: "Phép cộng (không nhớ) trong phạm vi 1 000",
        gameType: null,
        emoji: "➕",
        description: "Cộng không nhớ các số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b60",
        lessonNumber: 60,
        title: "Phép cộng (có nhớ) trong phạm vi 1 000",
        gameType: null,
        emoji: "➕",
        description: "Cộng có nhớ các số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b61",
        lessonNumber: 61,
        title: "Phép trừ (không nhớ) trong phạm vi 1 000",
        gameType: null,
        emoji: "➖",
        description: "Trừ không nhớ các số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b62",
        lessonNumber: 62,
        title: "Phép trừ (có nhớ) trong phạm vi 1 000",
        gameType: null,
        emoji: "➖",
        description: "Trừ có nhớ các số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b63",
        lessonNumber: 63,
        title: "Luyện tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp phép cộng, trừ trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-13",
    topicNumber: 13,
    title: "Làm quen với yếu tố thống kê, xác suất",
    color: "from-orange-400 to-yellow-300",
    accent: "text-orange-700",
    emoji: "📊",
    lessons: [
      {
        id: "math2-b64",
        lessonNumber: 64,
        title: "Thu thập, phân loại, kiểm đếm số liệu",
        gameType: null,
        emoji: "📋",
        description: "Thu thập và phân loại số liệu đơn giản.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b65",
        lessonNumber: 65,
        title: "Biểu đồ tranh",
        gameType: null,
        emoji: "🖼️",
        description: "Đọc và vẽ biểu đồ tranh.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b66",
        lessonNumber: 66,
        title: "Chắc chắn, có thể, không thể",
        gameType: null,
        emoji: "🎲",
        description: "Nhận biết sự kiện chắc chắn, có thể, không thể.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b67",
        lessonNumber: 67,
        title: "Thực hành và trải nghiệm thu thập, phân loại, kiểm đếm số liệu",
        gameType: null,
        emoji: "🔬",
        description: "Thực hành thu thập, phân loại và kiểm đếm số liệu.",
        requiredPlan: "PRO",
      },
    ],
  },
  {
    id: "topic-14",
    topicNumber: 14,
    title: "Ôn tập cuối năm",
    color: "from-red-400 to-rose-300",
    accent: "text-red-700",
    emoji: "🎓",
    lessons: [
      {
        id: "math2-b68",
        lessonNumber: 68,
        title: "Ôn tập các số trong phạm vi 1 000",
        gameType: null,
        emoji: "🔢",
        description: "Ôn lại các số trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b69",
        lessonNumber: 69,
        title: "Ôn tập phép cộng, phép trừ trong phạm vi 100",
        gameType: null,
        emoji: "➕",
        description: "Ôn lại phép cộng, trừ trong phạm vi 100.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b70",
        lessonNumber: 70,
        title: "Ôn tập phép cộng, phép trừ trong phạm vi 1 000",
        gameType: null,
        emoji: "🧮",
        description: "Ôn lại phép cộng, trừ trong phạm vi 1 000.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b71",
        lessonNumber: 71,
        title: "Ôn tập phép nhân, phép chia",
        gameType: null,
        emoji: "✖️",
        description: "Ôn lại phép nhân và phép chia.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b72",
        lessonNumber: 72,
        title: "Ôn tập hình học",
        gameType: null,
        emoji: "📐",
        description: "Ôn lại các kiến thức về hình phẳng và hình khối.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b73",
        lessonNumber: 73,
        title: "Ôn tập đo lường",
        gameType: null,
        emoji: "📏",
        description: "Ôn lại các đơn vị đo lường: kg, lít, m, km, giờ, phút.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b74",
        lessonNumber: 74,
        title: "Ôn tập kiểm đếm số liệu và lựa chọn khả năng",
        gameType: null,
        emoji: "📊",
        description: "Ôn lại thu thập số liệu, biểu đồ tranh, xác suất.",
        requiredPlan: "PRO",
      },
      {
        id: "math2-b75",
        lessonNumber: 75,
        title: "Ôn tập chung",
        gameType: null,
        emoji: "🏋️",
        description: "Tổng hợp ôn tập toàn bộ chương trình Toán lớp 2.",
        requiredPlan: "PRO",
      },
    ],
  },
];

// ─── Quiz Questions ───────────────────────────────────────────────────────────

export interface Math2QuizQuestion {
  id: number;
  question: string;
  /** Visual hint shown above the question (e.g. a number line) */
  visual?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Bài 2 – Tia số. Số liền trước, số liền sau */
export const MATH2_B2_QUIZ: Math2QuizQuestion[] = [
  {
    id: 1,
    question: "Số liền trước của 15 là số nào?",
    options: ["13", "14", "16", "17"],
    correctIndex: 1,
    explanation: "Số liền trước của 15 là 14, vì 14 + 1 = 15.",
  },
  {
    id: 2,
    question: "Số liền sau của 29 là số nào?",
    options: ["28", "31", "30", "27"],
    correctIndex: 2,
    explanation: "Số liền sau của 29 là 30, vì 29 + 1 = 30.",
  },
  {
    id: 3,
    question: "Điền số thiếu vào dãy: 10, 11, ▢, 13, 14",
    visual: "10 → 11 → ▢ → 13 → 14",
    options: ["9", "12", "15", "10"],
    correctIndex: 1,
    explanation: "Dãy số tăng dần 1 đơn vị, số thiếu là 12.",
  },
  {
    id: 4,
    question: "Trên tia số, số nào đứng liền trước số 50?",
    visual: "... → ▢ → 50 → 51 → ...",
    options: ["48", "51", "49", "45"],
    correctIndex: 2,
    explanation: "Số liền trước của 50 là 49, vì 49 + 1 = 50.",
  },
  {
    id: 5,
    question: "Số liền sau của 99 là số nào?",
    options: ["98", "100", "101", "90"],
    correctIndex: 1,
    explanation: "Số liền sau của 99 là 100, vì 99 + 1 = 100.",
  },
  {
    id: 6,
    question: "Số 23 nằm giữa hai số nào trên tia số?",
    visual: "... → ▢ → 23 → ▢ → ...",
    options: ["21 và 25", "22 và 24", "20 và 26", "23 và 25"],
    correctIndex: 1,
    explanation: "Số 23 nằm giữa 22 (liền trước) và 24 (liền sau).",
  },
  {
    id: 7,
    question: "Điền số thiếu: 5, 10, 15, ▢, 25",
    visual: "5 → 10 → 15 → ▢ → 25",
    options: ["18", "22", "20", "16"],
    correctIndex: 2,
    explanation: "Dãy số tăng dần 5 đơn vị: 5, 10, 15, 20, 25.",
  },
  {
    id: 8,
    question: "Dãy số nào được sắp xếp từ bé đến lớn?",
    options: [
      "32, 31, 33, 34",
      "45, 46, 47, 48",
      "28, 30, 29, 31",
      "50, 48, 49, 51",
    ],
    correctIndex: 1,
    explanation: "Dãy 45, 46, 47, 48 tăng dần đúng thứ tự từ bé đến lớn.",
  },
  {
    id: 9,
    question: "Số liền trước của số liền sau số 70 là số nào?",
    options: ["69", "70", "71", "72"],
    correctIndex: 1,
    explanation: "Số liền sau 70 là 71. Số liền trước 71 là 70.",
  },
  {
    id: 10,
    question: "Điền số thiếu vào tia số: 2, 4, ▢, 8, 10",
    visual: "2 → 4 → ▢ → 8 → 10",
    options: ["5", "7", "6", "3"],
    correctIndex: 2,
    explanation: "Dãy số tăng dần 2 đơn vị: 2, 4, 6, 8, 10.",
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

export function getMath2TopicByLessonId(
  lessonId: string,
): Math2Topic | undefined {
  return MATH2_TOPICS.find((t) => t.lessons.some((l) => l.id === lessonId));
}

// ─── Plan Access Control ──────────────────────────────────────────────────────

const PLAN_RANK: Record<PlanType, number> = { FREE: 0, PRO: 1, VIP: 2 };

/** Get the active child's plan from localStorage */
export function getActiveChildPlan(): PlanType {
  try {
    const activeId = localStorage.getItem(ACTIVE_CHILD_ID_KEY);
    const profiles = loadChildProfiles();
    if (activeId) {
      const child = profiles.find((p) => p.id === activeId);
      if (child) return child.plan;
    }
    if (profiles.length > 0) return profiles[0].plan;
  } catch {
    // ignore
  }
  return "FREE";
}

/** Check if user's plan can access a lesson */
export function canAccessLesson(
  lesson: Math2Lesson,
  userPlan: PlanType,
): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[lesson.requiredPlan];
}

/** Per-child completed lesson ids (local) — key matches `Math2Lesson.id` */
export const MATH2_COMPLETED_LESSONS_KEY = "violympic_math2_completed_v1";

export function getMath2CompletedLessonIds(childId: string): Set<string> {
  try {
    const raw = localStorage.getItem(MATH2_COMPLETED_LESSONS_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw) as Record<string, string[]>;
    return new Set(data[childId] ?? []);
  } catch {
    return new Set();
  }
}

export function markMath2LessonCompleted(childId: string, lessonId: string) {
  try {
    const raw = localStorage.getItem(MATH2_COMPLETED_LESSONS_KEY);
    const data: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const next = new Set(data[childId] ?? []);
    next.add(lessonId);
    data[childId] = [...next];
    localStorage.setItem(MATH2_COMPLETED_LESSONS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("math2-progress-updated"));
  } catch {
    // ignore
  }
}

/** Route to open when bé bấm "Vào học ngay" */
export function getMath2LessonPlayRoute(lesson: Math2Lesson): string | null {
  switch (lesson.gameType) {
    case "number-review-game":
      return "/student/game/math2-b1";
    case "number-sequence-chart":
      // Bài 2: luôn qua trang lý thuyết (robot Tí Tách + trục số) rồi mới vào game
      return "/student/theory/math2-b2";
    case "add-across-ten-game":
      return "/student/game/math2-b7";
    case "pipe-balance-game":
      return "/student/game/pipe-balance";
    default:
      return null;
  }
}

/** Human-readable plan labels */
export const PLAN_LABELS: Record<
  PlanType,
  { label: string; color: string; bg: string; icon: string }
> = {
  FREE: {
    label: "Miễn phí",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: "🆓",
  },
  PRO: { label: "Pro", color: "text-blue-600", bg: "bg-blue-100", icon: "⚡" },
  VIP: {
    label: "VIP",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: "👑",
  },
};

export const MATH2_B1_QUIZ: Math2QuizQuestion[] = [
  {
    id: 1,
    question: "Số gồm 5 chục và 8 đơn vị là số nào?",
    options: ["85", "58", "508", "50"],
    correctIndex: 1,
    explanation: "Số gồm 5 chục và 8 đơn vị được viết là 58.",
  },
  {
    id: 2,
    question: "Số lớn nhất có hai chữ số là số nào?",
    options: ["10", "90", "99", "100"],
    correctIndex: 2,
    explanation: "Trong các số có 2 chữ số (từ 10 đến 99), thì 99 là số lớn nhất.",
  },
  {
    id: 3,
    question: "Số nào điền vào tia số: 10, 20, 30, ▢, 50?",
    visual: "10 → 20 → 30 → ▢ → 50",
    options: ["35", "40", "45", "100"],
    correctIndex: 1,
    explanation: "Đây là các số tròn chục tăng dần: 10, 20, 30, 40, 50.",
  },
  {
    id: 4,
    question: "Số liền trước của số 60 là số nào?",
    options: ["61", "59", "50", "60"],
    correctIndex: 1,
    explanation: "Số liền trước của 60 là 60 - 1 = 59.",
  },
  {
    id: 5,
    question: "Số 73 đọc là gì?",
    options: ["Bảy ba", "Bảy mươi", "Bảy mươi ba", "Ba mươi bảy"],
    correctIndex: 2,
    explanation: "Số 73 đọc là bảy mươi ba.",
  }
];
