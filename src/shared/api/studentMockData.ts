// ─── Types ────────────────────────────────────────────────────────────────────

export type LessonStatus = "done" | "active" | "locked";

export type Shape3DName = "cube" | "sphere" | "cylinder" | "cone" | "pyramid";
export type QuestionType =
  | "multiple-choice"
  | "count-tap"
  | "true-false"
  | "drag-match";

/** Stats shown in the explanation panel */
export interface ExplanationStat {
  label: string;
  value: string | number;
  icon: string;
}

/** Rich explanation data shown after answering */
export interface ExplanationDetail {
  funFact?: string;
  stats?: ExplanationStat[];
  shape3d?: Shape3DName;
}

// ── Question variants (discriminated union) ───────────────────────────────────

interface BaseQuestion {
  id: number;
  text: string;
  emoji?: string;
  shape3d?: Shape3DName;
  hint: string;
  explanation: string;
  explanationDetail?: ExplanationDetail;
}

export interface MCQuestion extends BaseQuestion {
  type?: "multiple-choice";
  options: string[];
  correctIndex: number;
}

export interface CountTapQuestion extends BaseQuestion {
  type: "count-tap";
  countTap: {
    targetCount: number;
    label: string; // "mặt", "cạnh", "đỉnh"
    maxCount?: number;
  };
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false";
  trueFalse: {
    isTrue: boolean;
  };
}

export interface DragMatchQuestion extends BaseQuestion {
  type: "drag-match";
  dragMatch: {
    pairs: { left: string; right: string }[];
  };
}

export type QuizQuestion =
  | MCQuestion
  | CountTapQuestion
  | TrueFalseQuestion
  | DragMatchQuestion;

/** Type-guard helpers */
export function isMCQ(q: QuizQuestion): q is MCQuestion {
  return !q.type || q.type === "multiple-choice";
}
export function isCountTap(q: QuizQuestion): q is CountTapQuestion {
  return q.type === "count-tap";
}
export function isTrueFalse(q: QuizQuestion): q is TrueFalseQuestion {
  return q.type === "true-false";
}
export function isDragMatch(q: QuizQuestion): q is DragMatchQuestion {
  return q.type === "drag-match";
}

// ── Game Activity Types (interactive learning, separate from quiz) ───────────

export type GameType =
  | "number-line"
  | "object-count"
  | "fill-blank"
  | "shape-explore";

interface BaseGameActivity {
  id: number;
  type: GameType;
  instruction: string;
  emoji: string;
  xpReward: number;
}

export interface NumberLineGame extends BaseGameActivity {
  type: "number-line";
  numberLine: {
    start: number;
    end: number;
    /** Positions (values) that the student must fill in */
    missing: number[];
  };
}

export interface ObjectCountGame extends BaseGameActivity {
  type: "object-count";
  objectCount: {
    objectEmoji: string;
    /** Grid of objects – student counts them */
    count: number;
    /** Distractor counts shown as options */
    options: number[];
  };
}

export interface FillBlankGame extends BaseGameActivity {
  type: "fill-blank";
  fillBlank: {
    /** e.g. "Số liền trước của 7 là ___" */
    question: string;
    answer: number;
    options: number[];
  };
}

export interface ShapeExploreGame extends BaseGameActivity {
  type: "shape-explore";
  shapeExplore: {
    shape: Shape3DName;
    /** Facts the student discovers by interacting */
    facts: { label: string; value: string; icon: string }[];
    /** Challenge question after exploring */
    challengeText: string;
    challengeAnswer: string;
    challengeOptions: string[];
  };
}

export type GameActivity =
  | NumberLineGame
  | ObjectCountGame
  | FillBlankGame
  | ShapeExploreGame;

export function isNumberLine(g: GameActivity): g is NumberLineGame {
  return g.type === "number-line";
}
export function isObjectCount(g: GameActivity): g is ObjectCountGame {
  return g.type === "object-count";
}
export function isFillBlank(g: GameActivity): g is FillBlankGame {
  return g.type === "fill-blank";
}
export function isShapeExplore(g: GameActivity): g is ShapeExploreGame {
  return g.type === "shape-explore";
}

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  emoji: string;
  description: string;
  status: LessonStatus;
  xpReward: number;
  duration: number; // minutes
  questions: QuizQuestion[];
  /** Interactive game activities (separate from quiz) */
  games: GameActivity[];
  /** position on winding path [left%, top%] */
  pos: [number, number];
}

export interface Chapter {
  id: number;
  title: string;
  emoji: string;
  description: string;
  color: string; // tailwind bg
  accent: string; // tailwind text
  shadow: string; // css shadow
  lessons: Lesson[];
}

// ─── Chapter 1 – Hình học 3D ──────────────────────────────────────────────────

const CUBE_STATS = [
  { label: "Mặt", value: 6, icon: "🟦" },
  { label: "Cạnh", value: 12, icon: "📏" },
  { label: "Đỉnh", value: 8, icon: "⭐" },
];
const SPHERE_STATS = [
  { label: "Mặt phẳng", value: 0, icon: "⭕" },
  { label: "Cạnh", value: 0, icon: "📏" },
  { label: "Đỉnh", value: 0, icon: "⭐" },
];
const CYLINDER_STATS = [
  { label: "Mặt", value: 3, icon: "🟢" },
  { label: "Cạnh", value: 2, icon: "📏" },
  { label: "Đỉnh", value: 0, icon: "⭐" },
];
const PYRAMID_STATS = [
  { label: "Mặt (tứ giác)", value: 5, icon: "🔺" },
  { label: "Cạnh", value: 8, icon: "📏" },
  { label: "Đỉnh", value: 5, icon: "⭐" },
];

const chapter1Lessons: Lesson[] = [
  {
    id: 101,
    chapterId: 1,
    title: "Khám phá khối Lập phương",
    emoji: "📦",
    description: "Tìm hiểu về khối lập phương: mặt, góc và ứng dụng thực tế.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    games: [
      {
        id: 1,
        type: "shape-explore",
        instruction: "Xoay khối lập phương và khám phá các mặt của nó!",
        emoji: "📦",
        xpReward: 3,
        shapeExplore: {
          shape: "cube",
          facts: [
            { label: "Mặt", value: "6 mặt vuông", icon: "🟦" },
            { label: "Cạnh", value: "12 cạnh bằng nhau", icon: "📏" },
            { label: "Đỉnh", value: "8 đỉnh", icon: "⭐" },
          ],
          challengeText: "Vật nào giống khối lập phương?",
          challengeAnswer: "Hộp sữa vuông",
          challengeOptions: [
            "Quả bóng",
            "Hộp sữa vuông",
            "Lon nước",
            "Cái nón",
          ],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm số mặt của khối lập phương!",
        emoji: "🔢",
        xpReward: 2,
        objectCount: {
          objectEmoji: "🟦",
          count: 6,
          options: [4, 6, 8, 10],
        },
      },
    ],
    questions: [
      {
        id: 1,
        type: "count-tap",
        text: "Hãy đếm: Khối lập phương có bao nhiêu mặt?",
        emoji: "📦",
        shape3d: "cube",
        countTap: { targetCount: 6, label: "mặt", maxCount: 12 },
        hint: "Xoay hình 3D và đếm từng mặt: trên, dưới, trước, sau, trái, phải!",
        explanation:
          "Khối lập phương có 6 mặt, mỗi mặt là một hình vuông bằng nhau. 🎉",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Viên xúc xắc mà bé hay chơi chính là một khối lập phương! Tổng các mặt đối diện luôn bằng 7.",
        },
      },
      // ── Q2: MCQ ──
      {
        id: 2,
        text: "Mỗi mặt của khối lập phương là hình gì?",
        emoji: "🔷",
        shape3d: "cube",
        options: ["Hình tròn", "Hình tam giác", "Hình vuông", "Hình chữ nhật"],
        correctIndex: 2,
        hint: "Nhìn vào các mặt của chiếc hộp — chúng đều như nhau!",
        explanation:
          "Mỗi mặt của khối lập phương là hình vuông — đẹp và đều nhau! ✨",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            'Chữ "lập phương" nghĩa là vuông đều mọi hướng. Tất cả 6 mặt đều là hình vuông giống hệt nhau!',
        },
      },
      // ── Q3: count-tap (đếm đỉnh) ──
      {
        id: 3,
        type: "count-tap",
        text: "Đếm xem: Khối lập phương có bao nhiêu đỉnh?",
        emoji: "🔢",
        shape3d: "cube",
        countTap: { targetCount: 8, label: "đỉnh", maxCount: 12 },
        hint: "Đỉnh là chỗ 3 cạnh gặp nhau. Xoay hình 3D và đếm các góc!",
        explanation:
          "Khối lập phương có 8 đỉnh — giống như 8 góc của chiếc hộp! 💡",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Mỗi đỉnh của khối lập phương là nơi 3 mặt và 3 cạnh gặp nhau!",
        },
      },
      // ── Q4: MCQ ──
      {
        id: 4,
        text: "Ví dụ nào dưới đây là khối lập phương?",
        emoji: "🌍",
        shape3d: "cube",
        options: ["Quả bóng", "Hộp sữa vuông", "Lon nước ngọt", "Quả cam"],
        correctIndex: 1,
        hint: "Tìm vật có 6 mặt bằng nhau là hình vuông!",
        explanation: "Hộp sữa vuông là ví dụ điển hình của khối lập phương! 🥛",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Rubik's Cube cũng là một khối lập phương nổi tiếng. Nó có hơn 43 tỷ tỷ cách xoay khác nhau!",
        },
      },
      // ── Q5: count-tap (đếm cạnh) ──
      {
        id: 5,
        type: "count-tap",
        text: "Đếm nào: Khối lập phương có bao nhiêu cạnh?",
        emoji: "📏",
        shape3d: "cube",
        countTap: { targetCount: 12, label: "cạnh", maxCount: 16 },
        hint: "Cạnh là đường nối 2 đỉnh. Mỗi mặt vuông có 4 cạnh, nhưng mỗi cạnh được chia sẻ!",
        explanation: "Khối lập phương có 12 cạnh, tất cả đều bằng nhau! 🏆",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Công thức Euler: Đỉnh − Cạnh + Mặt = 2. Thử kiểm tra: 8 − 12 + 6 = 2. Đúng rồi! 🧮",
        },
      },
    ],
  },
  {
    id: 102,
    chapterId: 1,
    title: "Đếm các mặt của khối cầu",
    emoji: "🔵",
    description: "Khám phá khối cầu tròn và so sánh với các khối khác.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [35, 53],
    games: [
      {
        id: 1,
        type: "shape-explore",
        instruction: "Khám phá khối cầu — xoay và quan sát!",
        emoji: "⚽",
        xpReward: 3,
        shapeExplore: {
          shape: "sphere",
          facts: [
            { label: "Mặt phẳng", value: "0 (toàn cong)", icon: "⭕" },
            { label: "Cạnh", value: "0", icon: "📏" },
            { label: "Đỉnh", value: "0", icon: "⭐" },
          ],
          challengeText: "Khối cầu có bao nhiêu mặt phẳng?",
          challengeAnswer: "0",
          challengeOptions: ["0", "1", "2", "6"],
        },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Điền vào chỗ trống!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "Khối cầu có thể lăn được ___ hướng",
          answer: 0,
          options: [0, 1, 2, 3],
        },
      },
    ],
    questions: [
      {
        id: 1,
        type: "true-false",
        text: "Đúng hay Sai: Khối cầu có 2 mặt phẳng?",
        emoji: "⚽",
        shape3d: "sphere",
        trueFalse: { isTrue: false },
        hint: "Cầm quả bóng lên — có mặt phẳng nào không?",
        explanation:
          "SAI — Khối cầu không có mặt phẳng nào cả! Toàn bộ bề mặt đều cong. 🌟",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Trái đất cũng gần giống khối cầu! Nhưng nó hơi dẹt ở hai cực vì tự quay.",
        },
      },
      // ── Q2: true-false ──
      {
        id: 2,
        type: "true-false",
        text: "Đúng hay Sai: Khối cầu có thể lăn được mọi hướng?",
        emoji: "🏀",
        shape3d: "sphere",
        trueFalse: { isTrue: true },
        hint: "Hãy nghĩ về quả bóng đá khi sút!",
        explanation:
          "ĐÚNG — Khối cầu lăn được mọi hướng vì bề mặt hoàn toàn cong, không có góc cạnh! ⚽",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Bong bóng xà phòng tạo hình cầu vì đó là hình dạng có diện tích bề mặt nhỏ nhất cho cùng thể tích!",
        },
      },
      // ── Q3: MCQ ──
      {
        id: 3,
        text: "Ví dụ nào dưới đây là khối cầu?",
        emoji: "🌍",
        shape3d: "sphere",
        options: ["Hộp sữa", "Quả dưa hấu tròn", "Quyển sách", "Chiếc bàn"],
        correctIndex: 1,
        hint: "Tìm vật tròn hoàn toàn!",
        explanation: "Quả dưa hấu tròn là ví dụ của khối cầu! 🍉",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Quả bóng đá, viên bi, quả địa cầu — tất cả đều có dạng khối cầu!",
        },
      },
      // ── Q4: count-tap (đếm đỉnh = 0) ──
      {
        id: 4,
        type: "count-tap",
        text: "Đếm xem: Khối cầu có bao nhiêu đỉnh?",
        emoji: "🔢",
        shape3d: "sphere",
        countTap: { targetCount: 0, label: "đỉnh", maxCount: 10 },
        hint: "Khối cầu tròn trơn, có góc nhọn nào không?",
        explanation: "Khối cầu có 0 đỉnh vì bề mặt hoàn toàn cong! 💫",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Khối cầu là hình duy nhất mà nhìn từ hướng nào cũng giống hệt nhau!",
        },
      },
      // ── Q5: MCQ ──
      {
        id: 5,
        text: "So với khối lập phương, khối cầu có gì khác?",
        emoji: "🤔",
        shape3d: "sphere",
        options: [
          "Khối cầu có mặt phẳng",
          "Khối cầu không có mặt phẳng và đỉnh",
          "Khối cầu có nhiều cạnh hơn",
          "Chúng giống nhau hoàn toàn",
        ],
        correctIndex: 1,
        hint: "Nhớ lại: khối lập phương có 6 mặt phẳng!",
        explanation:
          "Khối cầu không có mặt phẳng và đỉnh, khác hoàn toàn với khối lập phương! 🎯",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Khối lập phương có 6 mặt, 12 cạnh, 8 đỉnh. Khối cầu có 0-0-0. Hai hình hoàn toàn trái ngược!",
        },
      },
    ],
  },
  {
    id: 103,
    chapterId: 1,
    title: "Tìm hiểu hình trụ",
    emoji: "🥤",
    description: "Hình trụ trong cuộc sống hàng ngày và các đặc điểm nổi bật.",
    status: "active",
    xpReward: 15,
    duration: 6,
    pos: [60, 35],
    games: [
      {
        id: 1,
        type: "shape-explore",
        instruction: "Xoay hình trụ và tìm hiểu cấu tạo!",
        emoji: "🧃",
        xpReward: 3,
        shapeExplore: {
          shape: "cylinder",
          facts: [
            { label: "Mặt", value: "3 (2 tròn + 1 cong)", icon: "🟢" },
            { label: "Cạnh", value: "2 cạnh tròn", icon: "📏" },
            { label: "Đỉnh", value: "0", icon: "⭐" },
          ],
          challengeText: "Vật nào có dạng hình trụ?",
          challengeAnswer: "Lon nước ngọt",
          challengeOptions: ["Quả bóng", "Lon nước ngọt", "Hộp quà", "Mũ nhọn"],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm số mặt của hình trụ!",
        emoji: "🔢",
        xpReward: 2,
        objectCount: {
          objectEmoji: "🟢",
          count: 3,
          options: [2, 3, 4, 6],
        },
      },
    ],
    questions: [
      {
        id: 1,
        type: "count-tap",
        text: "Hình trụ có bao nhiêu mặt?",
        emoji: "🥤",
        shape3d: "cylinder",
        countTap: { targetCount: 3, label: "mặt", maxCount: 8 },
        hint: "Nhìn vào lon nước ngọt: trên, dưới và mặt cong xung quanh!",
        explanation:
          "Hình trụ có 3 mặt: 2 mặt tròn (trên và dưới) + 1 mặt cong xung quanh! 🥤",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Nếu cắt mặt cong hình trụ và trải ra, ta sẽ được một hình chữ nhật!",
        },
      },
      // ── Q2: MCQ ──
      {
        id: 2,
        text: "Hai mặt phẳng của hình trụ có hình gì?",
        emoji: "⭕",
        shape3d: "cylinder",
        options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"],
        correctIndex: 1,
        hint: "Nhìn từ trên xuống lon nước ngọt!",
        explanation:
          "Hai mặt phẳng của hình trụ là hai hình tròn bằng nhau! ⭕",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Hai hình tròn ở hai đầu hình trụ luôn song song và có cùng kích thước!",
        },
      },
      // ── Q3: true-false ──
      {
        id: 3,
        type: "true-false",
        text: "Đúng hay Sai: Hình trụ có thể lăn sang hai bên?",
        emoji: "🏗️",
        shape3d: "cylinder",
        trueFalse: { isTrue: true },
        hint: "Đặt lon nước ngọt nằm ngang và đẩy nhẹ!",
        explanation:
          "ĐÚNG — Hình trụ lăn được sang hai bên nhờ mặt cong bên ngoài! 🎡",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Hình trụ chỉ lăn theo một hướng (sang bên), khác với khối cầu lăn mọi hướng!",
        },
      },
      // ── Q4: MCQ ──
      {
        id: 4,
        text: "Vật nào sau đây có dạng hình trụ?",
        emoji: "🌍",
        shape3d: "cylinder",
        options: ["Quả bóng", "Hộp bánh vuông", "Lon nước ngọt", "Quyển vở"],
        correctIndex: 2,
        hint: "Tìm vật có 2 đáy tròn và thân hình ống!",
        explanation: "Lon nước ngọt có dạng hình trụ! 🥤",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Ống nước, cục pin, cây nến — tất cả đều có dạng hình trụ trong cuộc sống!",
        },
      },
      // ── Q5: count-tap (đếm đỉnh) ──
      {
        id: 5,
        type: "count-tap",
        text: "Đếm nào: Hình trụ có bao nhiêu đỉnh?",
        emoji: "🔢",
        shape3d: "cylinder",
        countTap: { targetCount: 0, label: "đỉnh", maxCount: 8 },
        hint: "Nhìn lon nước ngọt — có góc nhọn không?",
        explanation: "Hình trụ có 0 đỉnh! Các cạnh đều tròn và cong. 💡",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Hình trụ có 2 cạnh (tròn) nhưng 0 đỉnh — vì không có chỗ nào nhọn cả!",
        },
      },
    ],
  },
  {
    id: 104,
    chapterId: 1,
    title: "Xây tháp với khối chóp",
    emoji: "🔺",
    description: "Tìm hiểu khối chóp tam giác và tứ giác.",
    status: "locked",
    xpReward: 15,
    duration: 7,
    pos: [76, 56],
    games: [
      {
        id: 1,
        type: "shape-explore",
        instruction: "Khám phá khối chóp — xoay và đếm!",
        emoji: "🔺",
        xpReward: 3,
        shapeExplore: {
          shape: "pyramid",
          facts: [
            { label: "Mặt", value: "5 (1 đáy + 4 bên)", icon: "🔺" },
            { label: "Cạnh", value: "8", icon: "📏" },
            { label: "Đỉnh", value: "5", icon: "⭐" },
          ],
          challengeText: "Kim tự tháp Ai Cập là hình gì?",
          challengeAnswer: "Khối chóp tứ giác",
          challengeOptions: [
            "Khối lập phương",
            "Khối chóp tứ giác",
            "Hình trụ",
            "Khối cầu",
          ],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Kim tự tháp thuộc loại hình nào?",
        emoji: "🏛️",
        shape3d: "pyramid",
        options: [
          "Khối lập phương",
          "Khối cầu",
          "Khối chóp tứ giác",
          "Hình trụ",
        ],
        correctIndex: 2,
        hint: "Kim tự tháp có đáy vuông và 4 mặt tam giác!",
        explanation: "Kim tự tháp là ví dụ điển hình của khối chóp tứ giác! 🏛️",
        explanationDetail: {
          shape3d: "pyramid",
          stats: PYRAMID_STATS,
          funFact:
            "Kim tự tháp Giza được xây cách đây hơn 4.500 năm và là 1 trong 7 kỳ quan thế giới cổ đại!",
        },
      },
      // ── Q2: count-tap (đếm mặt chóp tam giác) ──
      {
        id: 2,
        type: "count-tap",
        text: "Đếm xem: Khối chóp tam giác có bao nhiêu mặt?",
        emoji: "🔺",
        shape3d: "pyramid",
        countTap: { targetCount: 4, label: "mặt", maxCount: 8 },
        hint: "Đếm cả đáy và các mặt bên! Đáy là tam giác + 3 mặt bên.",
        explanation:
          "Khối chóp tam giác có 4 mặt: 1 đáy tam giác + 3 mặt bên tam giác! 🎯",
        explanationDetail: {
          shape3d: "pyramid",
          stats: [
            { label: "Mặt", value: 4, icon: "🔺" },
            { label: "Cạnh", value: 6, icon: "📏" },
            { label: "Đỉnh", value: 4, icon: "⭐" },
          ],
          funFact:
            "Khối chóp tam giác còn gọi là tứ diện. Tất cả mặt đều là tam giác!",
        },
      },
      // ── Q3: count-tap (đếm đỉnh chóp tứ giác) ──
      {
        id: 3,
        type: "count-tap",
        text: "Đếm xem: Khối chóp tứ giác có bao nhiêu đỉnh?",
        emoji: "⛰️",
        shape3d: "pyramid",
        countTap: { targetCount: 5, label: "đỉnh", maxCount: 10 },
        hint: "Đếm 4 góc đáy + 1 đỉnh trên cùng!",
        explanation:
          "Khối chóp tứ giác có 5 đỉnh: 4 đỉnh ở đáy + 1 đỉnh nhọn trên cùng! 🏔️",
        explanationDetail: {
          shape3d: "pyramid",
          stats: PYRAMID_STATS,
          funFact:
            "Đỉnh nhọn trên cùng gọi là 'đỉnh chóp' — nơi tất cả các mặt bên gặp nhau!",
        },
      },
      // ── Q4: count-tap (đếm mặt chóp tứ giác) ──
      {
        id: 4,
        type: "count-tap",
        text: "Đếm nào: Khối chóp tứ giác có bao nhiêu mặt?",
        emoji: "📐",
        shape3d: "pyramid",
        countTap: { targetCount: 5, label: "mặt", maxCount: 8 },
        hint: "1 đáy hình vuông + các mặt bên tam giác bao quanh!",
        explanation:
          "Khối chóp tứ giác có 5 mặt: 1 đáy hình vuông + 4 mặt tam giác! 🌟",
        explanationDetail: {
          shape3d: "pyramid",
          stats: PYRAMID_STATS,
          funFact:
            "Khối chóp tứ giác rất vững chãi — đó là lý do người Ai Cập cổ đại chọn hình này để xây kim tự tháp!",
        },
      },
      // ── Q5: MCQ ──
      {
        id: 5,
        text: "Đặc điểm nào giúp nhận biết khối chóp?",
        emoji: "🤔",
        shape3d: "cone",
        options: [
          "Có tất cả mặt là hình vuông",
          "Có một đỉnh nhọn ở trên cùng",
          "Không có đỉnh nào",
          "Có 2 mặt tròn",
        ],
        correctIndex: 1,
        hint: "Nghĩ về hình kim tự tháp!",
        explanation:
          "Khối chóp luôn có một đỉnh nhọn ở trên — đó là đặc điểm nổi bật! ⛰️",
        explanationDetail: {
          shape3d: "cone",
          stats: PYRAMID_STATS,
          funFact:
            "Cái nón lá Việt Nam cũng có dạng hình chóp! Đỉnh nhọn ở trên giúp nước mưa chảy xuống.",
        },
      },
    ],
  },
  {
    id: 105,
    chapterId: 1,
    title: "Thử thách tổng hợp 3D",
    emoji: "🏆",
    description: "Ôn tập tất cả các khối hình 3D đã học.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [88, 76],
    games: [
      {
        id: 1,
        type: "fill-blank",
        instruction: "Ghép hình với vật thật!",
        emoji: "🧩",
        xpReward: 3,
        fillBlank: {
          question: "Khối lập phương có ___ mặt",
          answer: 6,
          options: [4, 5, 6, 8],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Trong 4 hình đã học, hình nào có nhiều mặt nhất?",
        emoji: "📊",
        xpReward: 3,
        objectCount: {
          objectEmoji: "📦",
          count: 6,
          options: [3, 4, 5, 6],
        },
      },
    ],
    questions: [
      {
        id: 1,
        type: "true-false",
        text: "Đúng hay Sai: Khối cầu không có mặt phẳng?",
        emoji: "🤔",
        shape3d: "sphere",
        trueFalse: { isTrue: true },
        hint: "Hình nào tròn hoàn toàn, không có mặt phẳng?",
        explanation:
          "ĐÚNG — Khối cầu không có mặt phẳng. Tất cả bề mặt đều cong! ⚽",
        explanationDetail: {
          shape3d: "sphere",
          stats: SPHERE_STATS,
          funFact:
            "Trong tất cả các hình 3D đã học, chỉ có khối cầu là không có mặt phẳng nào!",
        },
      },
      // ── Q2: MCQ ──
      {
        id: 2,
        text: "Hình nào có nhiều mặt nhất trong 4 hình đã học?",
        emoji: "📊",
        shape3d: "cube",
        options: [
          "Khối lập phương (6)",
          "Khối cầu (0)",
          "Hình trụ (3)",
          "Khối chóp tam giác (4)",
        ],
        correctIndex: 0,
        hint: "Đếm mặt của từng hình!",
        explanation:
          "Khối lập phương có 6 mặt phẳng — nhiều nhất trong các hình đã học! 📦",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Xếp hạng: Lập phương (6) > Chóp tứ giác (5) > Chóp tam giác (4) > Hình trụ (3) > Cầu (0).",
        },
      },
      // ── Q3: true-false ──
      {
        id: 3,
        type: "true-false",
        text: "Đúng hay Sai: Hình trụ lăn được mọi hướng giống khối cầu?",
        emoji: "🎲",
        shape3d: "cylinder",
        trueFalse: { isTrue: false },
        hint: "Khối cầu lăn mọi hướng, hình trụ thì sao?",
        explanation:
          "SAI — Hình trụ chỉ lăn sang hai bên, không lăn được mọi hướng như khối cầu! 🌍",
        explanationDetail: {
          shape3d: "cylinder",
          stats: CYLINDER_STATS,
          funFact:
            "Khối cầu lăn 360° mọi hướng. Hình trụ chỉ lăn theo 1 trục. Lập phương không lăn được!",
        },
      },
      // ── Q4: MCQ ──
      {
        id: 4,
        text: "Vật nào CÓ CÙNG hình dạng với khối lập phương?",
        emoji: "🌍",
        shape3d: "cube",
        options: [
          "Quả bóng tennis",
          "Hộp quà vuông",
          "Ống hút nước",
          "Mũ sinh nhật nhọn",
        ],
        correctIndex: 1,
        hint: "Tìm vật có 6 mặt bằng nhau!",
        explanation:
          "Hộp quà vuông có 6 mặt hình vuông bằng nhau — đó là khối lập phương! 🎁",
        explanationDetail: {
          shape3d: "cube",
          stats: CUBE_STATS,
          funFact:
            "Bóng tennis = cầu, Ống hút = trụ, Mũ sinh nhật = chóp. Mỗi vật có hình 3D riêng!",
        },
      },
      // ── Q5: drag-match ──
      {
        id: 5,
        type: "drag-match",
        text: "Ghép mỗi khối hình với vật thật tương ứng!",
        emoji: "🧩",
        shape3d: "cube",
        dragMatch: {
          pairs: [
            { left: "📦 Khối lập phương", right: "🎁 Hộp quà vuông" },
            { left: "⚽ Khối cầu", right: "🏀 Quả bóng rổ" },
            { left: "🥤 Hình trụ", right: "🧃 Lon nước ngọt" },
            { left: "🔺 Khối chóp", right: "🎉 Mũ sinh nhật" },
          ],
        },
        hint: "Nhớ lại đặc điểm của mỗi hình: mặt phẳng, mặt cong, đỉnh nhọn!",
        explanation:
          "Mỗi hình 3D đều có vật thật tương ứng trong cuộc sống hàng ngày! 🎉",
        explanationDetail: {
          funFact:
            "Hãy nhìn quanh phòng bé — sẽ tìm thấy rất nhiều hình 3D: hộp đồ chơi (lập phương), quả bóng (cầu), cốc nước (trụ)!",
        },
      },
    ],
  },
];

// ─── Chapter 2 – Phép cộng ────────────────────────────────────────────────────

const chapter2Lessons: Lesson[] = [
  {
    id: 201,
    chapterId: 2,
    title: "Cộng trong phạm vi 10",
    emoji: "➕",
    description: "Thực hành cộng các số từ 1 đến 10 một cách vui nhộn.",
    status: "done",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Điền số còn thiếu trên tia số!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 0, end: 10, missing: [3, 5, 7] },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm số quả táo!",
        emoji: "🍎",
        xpReward: 2,
        objectCount: { objectEmoji: "🍎", count: 7, options: [5, 6, 7, 8] },
      },
      {
        id: 3,
        type: "fill-blank",
        instruction: "Tìm kết quả phép cộng!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "3 + 4 = ___",
          answer: 7,
          options: [6, 7, 8, 9],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "3 + 4 = ?",
        emoji: "🍎",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "Đếm thêm 4 từ số 3 nhé!",
        explanation: "3 + 4 = 7. Bé giỏi lắm! 🌟",
      },
      {
        id: 2,
        text: "5 + 5 = ?",
        emoji: "🍊",
        options: ["9", "10", "11", "12"],
        correctIndex: 1,
        hint: "5 cộng 5 bằng... cả hai bàn tay!",
        explanation: "5 + 5 = 10. Cả hai bàn tay bé là 10 ngón! 🙌",
      },
      {
        id: 3,
        text: "2 + 6 = ?",
        emoji: "🍇",
        options: ["7", "8", "9", "10"],
        correctIndex: 1,
        hint: "Đếm từ 6 thêm 2 nữa!",
        explanation: "2 + 6 = 8. Đúng rồi! 🎯",
      },
      {
        id: 4,
        text: "4 + 3 = ?",
        emoji: "🍓",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "4 ngón tay + 3 ngón tay = ?",
        explanation: "4 + 3 = 7. Xuất sắc! ⭐",
      },
      {
        id: 5,
        text: "1 + 9 = ?",
        emoji: "🍌",
        options: ["9", "10", "11", "8"],
        correctIndex: 1,
        hint: "9 cộng thêm 1 là đủ 10!",
        explanation: "1 + 9 = 10. Tuyệt vời! 🏆",
      },
    ],
  },
  {
    id: 202,
    chapterId: 2,
    title: "Cộng trong phạm vi 20",
    emoji: "🔢",
    description: "Bước tiếp theo: cộng các số lên đến 20.",
    status: "active",
    xpReward: 15,
    duration: 6,
    pos: [35, 53],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Điền số còn thiếu trên tia số từ 10 đến 20!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 10, end: 20, missing: [12, 15, 18] },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Tìm kết quả!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "8 + 7 = ___",
          answer: 15,
          options: [13, 14, 15, 16],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "8 + 7 = ?",
        emoji: "🌻",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "8 + 7 = 8 + 2 + 5 = 10 + 5!",
        explanation: "8 + 7 = 15. Bé thông minh quá! 🌟",
      },
      {
        id: 2,
        text: "9 + 6 = ?",
        emoji: "🌈",
        options: ["14", "15", "16", "17"],
        correctIndex: 1,
        hint: "9 + 1 = 10, còn dư 5 nữa!",
        explanation: "9 + 6 = 15. Làm tốt lắm! 🎉",
      },
      {
        id: 3,
        text: "7 + 8 = ?",
        emoji: "🦋",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "7 + 3 = 10, còn dư 5!",
        explanation: "7 + 8 = 15. Giỏi lắm bé ơi! ⭐",
      },
      {
        id: 4,
        text: "6 + 9 = ?",
        emoji: "🌺",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "6 + 4 = 10, còn dư 5!",
        explanation: "6 + 9 = 15. Xuất sắc! 🏆",
      },
      {
        id: 5,
        text: "10 + 8 = ?",
        emoji: "🎈",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "10 cộng thêm 8 nữa!",
        explanation: "10 + 8 = 18. Bé đã nắm vững phép cộng! 🎯",
      },
    ],
  },
  {
    id: 203,
    chapterId: 2,
    title: "Cộng có nhớ",
    emoji: "🧮",
    description: "Phép cộng có nhớ hàng chục thú vị.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [60, 35],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Nhảy trên tia số để tìm kết quả!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 10, end: 25, missing: [16, 21, 23] },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Tìm kết quả cộng có nhớ!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "16 + 5 = ___",
          answer: 21,
          options: [19, 20, 21, 22],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "16 + 5 = ?",
        emoji: "🔢",
        options: ["19", "20", "21", "22"],
        correctIndex: 2,
        hint: "16 + 4 = 20, còn 1 nữa!",
        explanation: "16 + 5 = 21! 🌟",
      },
      {
        id: 2,
        text: "13 + 9 = ?",
        emoji: "➕",
        options: ["21", "22", "23", "24"],
        correctIndex: 1,
        hint: "13 + 7 = 20, còn 2 nữa!",
        explanation: "13 + 9 = 22! 🎯",
      },
      {
        id: 3,
        text: "18 + 4 = ?",
        emoji: "🧮",
        options: ["20", "21", "22", "23"],
        correctIndex: 2,
        hint: "18 + 2 = 20, còn 2 nữa!",
        explanation: "18 + 4 = 22! ⭐",
      },
      {
        id: 4,
        text: "15 + 7 = ?",
        emoji: "🌻",
        options: ["20", "21", "22", "23"],
        correctIndex: 2,
        hint: "15 + 5 = 20, còn 2 nữa!",
        explanation: "15 + 7 = 22! 🏆",
      },
      {
        id: 5,
        text: "17 + 6 = ?",
        emoji: "🎊",
        options: ["21", "22", "23", "24"],
        correctIndex: 2,
        hint: "17 + 3 = 20, còn 3 nữa!",
        explanation: "17 + 6 = 23! 🎉",
      },
    ],
  },
  {
    id: 204,
    chapterId: 2,
    title: "Cộng ba số",
    emoji: "🎲",
    description: "Học cộng ba số cùng một lúc.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [76, 56],
    games: [
      {
        id: 1,
        type: "fill-blank",
        instruction: "Tìm tổng của 3 số!",
        emoji: "✍️",
        xpReward: 3,
        fillBlank: {
          question: "2 + 3 + 4 = ___",
          answer: 9,
          options: [7, 8, 9, 10],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm tổng số bóng bay!",
        emoji: "🎈",
        xpReward: 2,
        objectCount: {
          objectEmoji: "🎈",
          count: 15,
          options: [12, 13, 14, 15],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "2 + 3 + 4 = ?",
        emoji: "🍎",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "Cộng 2+3=5 trước, rồi cộng 4!",
        explanation: "2+3+4 = 9! 🎯",
      },
      {
        id: 2,
        text: "5 + 5 + 5 = ?",
        emoji: "🖐️",
        options: ["13", "14", "15", "16"],
        correctIndex: 2,
        hint: "3 lần 5 tay!",
        explanation: "5+5+5 = 15! ⭐",
      },
      {
        id: 3,
        text: "4 + 4 + 4 = ?",
        emoji: "🔢",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "3 lần 4!",
        explanation: "4+4+4 = 12! 🌟",
      },
      {
        id: 4,
        text: "1 + 2 + 3 = ?",
        emoji: "🎵",
        options: ["4", "5", "6", "7"],
        correctIndex: 2,
        hint: "1+2=3, 3+3=?",
        explanation: "1+2+3 = 6! 🏆",
      },
      {
        id: 5,
        text: "3 + 3 + 3 = ?",
        emoji: "🎈",
        options: ["6", "7", "8", "9"],
        correctIndex: 3,
        hint: "3 lần 3!",
        explanation: "3+3+3 = 9! 🎉",
      },
    ],
  },
  {
    id: 205,
    chapterId: 2,
    title: "Thử thách phép cộng",
    emoji: "🏆",
    description: "Tổng hợp tất cả kiến thức phép cộng đã học!",
    status: "locked",
    xpReward: 25,
    duration: 10,
    pos: [88, 76],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Tia số tổng hợp — điền số còn thiếu!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 0, end: 20, missing: [4, 9, 13, 17] },
      },
    ],
    questions: [
      {
        id: 1,
        text: "12 + 9 = ?",
        emoji: "🎯",
        options: ["19", "20", "21", "22"],
        correctIndex: 2,
        hint: "12+8=20, còn 1!",
        explanation: "12+9=21! 🌟",
      },
      {
        id: 2,
        text: "7 + 6 + 3 = ?",
        emoji: "🔢",
        options: ["14", "15", "16", "17"],
        correctIndex: 2,
        hint: "7+6=13, 13+3=16!",
        explanation: "7+6+3=16! ⭐",
      },
      {
        id: 3,
        text: "18 + 2 = ?",
        emoji: "🧮",
        options: ["18", "19", "20", "21"],
        correctIndex: 2,
        hint: "18+2 đủ 20!",
        explanation: "18+2=20! 🏆",
      },
      {
        id: 4,
        text: "9 + 9 = ?",
        emoji: "🎊",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "9+1=10, còn 8!",
        explanation: "9+9=18! 🎉",
      },
      {
        id: 5,
        text: "5 + 8 + 7 = ?",
        emoji: "🌈",
        options: ["18", "19", "20", "21"],
        correctIndex: 2,
        hint: "5+8=13, 13+7=20!",
        explanation: "5+8+7=20! 🎯",
      },
    ],
  },
];

// ─── Chapter 3 – Phép trừ ─────────────────────────────────────────────────────

const chapter3Lessons: Lesson[] = [
  {
    id: 301,
    chapterId: 3,
    title: "Trừ trong phạm vi 10",
    emoji: "➖",
    description: "Học phép trừ cơ bản trong phạm vi 10.",
    status: "locked",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Dùng tia số để trừ! Lùi lại từ số lớn.",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 0, end: 10, missing: [2, 5, 8] },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Tìm kết quả phép trừ!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "9 - 3 = ___",
          answer: 6,
          options: [5, 6, 7, 8],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "9 - 3 = ?",
        emoji: "🍎",
        options: ["5", "6", "7", "8"],
        correctIndex: 1,
        hint: "Bỏ 3 quả từ 9 quả!",
        explanation: "9-3=6! 🌟",
      },
      {
        id: 2,
        text: "8 - 4 = ?",
        emoji: "🍌",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "8 bớt 4 còn bao nhiêu?",
        explanation: "8-4=4! ⭐",
      },
      {
        id: 3,
        text: "7 - 2 = ?",
        emoji: "🍊",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "7 bớt 2!",
        explanation: "7-2=5! 🎯",
      },
      {
        id: 4,
        text: "10 - 6 = ?",
        emoji: "🍇",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        hint: "10 bớt 6!",
        explanation: "10-6=4! 🏆",
      },
      {
        id: 5,
        text: "6 - 1 = ?",
        emoji: "🍓",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        hint: "6 bớt đi 1!",
        explanation: "6-1=5! 🎉",
      },
    ],
  },
  {
    id: 302,
    chapterId: 3,
    title: "Trừ trong phạm vi 20",
    emoji: "🔢",
    description: "Mở rộng phép trừ lên đến 20.",
    status: "locked",
    xpReward: 15,
    duration: 6,
    pos: [35, 53],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Lùi trên tia số từ 20!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 5, end: 20, missing: [8, 12, 17] },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Tìm kết quả!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "18 - 9 = ___",
          answer: 9,
          options: [7, 8, 9, 10],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "15 - 7 = ?",
        emoji: "🌻",
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        hint: "15-5=10, 10-2=8!",
        explanation: "15-7=8! 🌟",
      },
      {
        id: 2,
        text: "18 - 9 = ?",
        emoji: "🌈",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "9+9=18, vậy 18-9=?",
        explanation: "18-9=9! ⭐",
      },
      {
        id: 3,
        text: "20 - 8 = ?",
        emoji: "🎈",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "20-10=10, 10+2=12!",
        explanation: "20-8=12! 🎯",
      },
      {
        id: 4,
        text: "16 - 7 = ?",
        emoji: "🦋",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "16-6=10, 10-1=9!",
        explanation: "16-7=9! 🏆",
      },
      {
        id: 5,
        text: "13 - 5 = ?",
        emoji: "🌺",
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        hint: "13-3=10, 10-2=8!",
        explanation: "13-5=8! 🎉",
      },
    ],
  },
  {
    id: 303,
    chapterId: 3,
    title: "Trừ có nhớ",
    emoji: "🧮",
    description: "Phép trừ có nhớ hàng chục thú vị.",
    status: "locked",
    xpReward: 20,
    duration: 7,
    pos: [60, 35],
    games: [
      {
        id: 1,
        type: "fill-blank",
        instruction: "Tìm kết quả trừ có nhớ!",
        emoji: "✍️",
        xpReward: 3,
        fillBlank: {
          question: "25 - 7 = ___",
          answer: 18,
          options: [16, 17, 18, 19],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "21 - 4 = ?",
        emoji: "🔢",
        options: ["16", "17", "18", "19"],
        correctIndex: 1,
        hint: "21-1=20, 20-3=17!",
        explanation: "21-4=17! 🌟",
      },
      {
        id: 2,
        text: "25 - 7 = ?",
        emoji: "➖",
        options: ["16", "17", "18", "19"],
        correctIndex: 2,
        hint: "25-5=20, 20-2=18!",
        explanation: "25-7=18! ⭐",
      },
      {
        id: 3,
        text: "32 - 6 = ?",
        emoji: "🧮",
        options: ["24", "25", "26", "27"],
        correctIndex: 2,
        hint: "32-2=30, 30-4=26!",
        explanation: "32-6=26! 🎯",
      },
      {
        id: 4,
        text: "40 - 8 = ?",
        emoji: "🌻",
        options: ["30", "31", "32", "33"],
        correctIndex: 2,
        hint: "40-10=30, 30+2=32!",
        explanation: "40-8=32! 🏆",
      },
      {
        id: 5,
        text: "28 - 9 = ?",
        emoji: "🎊",
        options: ["17", "18", "19", "20"],
        correctIndex: 2,
        hint: "28-8=20, 20-1=19!",
        explanation: "28-9=19! 🎉",
      },
    ],
  },
  {
    id: 304,
    chapterId: 3,
    title: "Bài toán trừ",
    emoji: "📝",
    description: "Giải bài toán đố liên quan đến phép trừ.",
    status: "locked",
    xpReward: 20,
    duration: 8,
    pos: [76, 56],
    games: [
      {
        id: 1,
        type: "object-count",
        instruction: "Có 10 quả táo, bé ăn 3 quả. Đếm số còn lại!",
        emoji: "🍎",
        xpReward: 3,
        objectCount: { objectEmoji: "🍎", count: 7, options: [5, 6, 7, 8] },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Giải bài toán!",
        emoji: "✍️",
        xpReward: 2,
        fillBlank: {
          question: "Có 15 bông hoa, cho 6 bông. Còn ___ bông",
          answer: 9,
          options: [7, 8, 9, 10],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Có 10 quả táo, bé ăn 3 quả. Còn lại?",
        emoji: "🍎",
        options: ["6", "7", "8", "9"],
        correctIndex: 1,
        hint: "10 bớt 3!",
        explanation: "10-3=7 quả táo! 🍎",
      },
      {
        id: 2,
        text: "Có 15 bông hoa, cho đi 6 bông. Còn lại?",
        emoji: "🌸",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        hint: "15 bớt 6!",
        explanation: "15-6=9 bông hoa! 🌸",
      },
      {
        id: 3,
        text: "Có 20 chiếc kẹo, ăn 8 chiếc. Còn lại?",
        emoji: "🍬",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "20 bớt 8!",
        explanation: "20-8=12 chiếc kẹo! 🍬",
      },
      {
        id: 4,
        text: "Lớp có 18 học sinh, 7 bạn về sớm. Còn lại?",
        emoji: "👦",
        options: ["9", "10", "11", "12"],
        correctIndex: 2,
        hint: "18 bớt 7!",
        explanation: "18-7=11 bạn! 👦",
      },
      {
        id: 5,
        text: "Có 16 con cá, 9 con bơi đi. Còn lại?",
        emoji: "🐟",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        hint: "16 bớt 9!",
        explanation: "16-9=7 con cá! 🐟",
      },
    ],
  },
  {
    id: 305,
    chapterId: 3,
    title: "Thử thách phép trừ",
    emoji: "🏆",
    description: "Ôn tập và thử thách tất cả kiến thức phép trừ!",
    status: "locked",
    xpReward: 25,
    duration: 10,
    pos: [88, 76],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Tia số tổng hợp — điền số!",
        emoji: "📏",
        xpReward: 3,
        numberLine: { start: 0, end: 20, missing: [3, 7, 11, 16] },
      },
    ],
    questions: [
      {
        id: 1,
        text: "30 - 14 = ?",
        emoji: "🎯",
        options: ["14", "15", "16", "17"],
        correctIndex: 2,
        hint: "30-10=20, 20-4=16!",
        explanation: "30-14=16! 🌟",
      },
      {
        id: 2,
        text: "22 - 8 = ?",
        emoji: "🔢",
        options: ["12", "13", "14", "15"],
        correctIndex: 2,
        hint: "22-2=20, 20-6=14!",
        explanation: "22-8=14! ⭐",
      },
      {
        id: 3,
        text: "50 - 23 = ?",
        emoji: "🧮",
        options: ["25", "26", "27", "28"],
        correctIndex: 2,
        hint: "50-20=30, 30-3=27!",
        explanation: "50-23=27! 🏆",
      },
      {
        id: 4,
        text: "18 - 9 + 3 = ?",
        emoji: "🎊",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "18-9=9, 9+3=12!",
        explanation: "18-9+3=12! 🎉",
      },
      {
        id: 5,
        text: "20 - 7 - 3 = ?",
        emoji: "🌈",
        options: ["8", "9", "10", "11"],
        correctIndex: 2,
        hint: "20-7=13, 13-3=10!",
        explanation: "20-7-3=10! 🎯",
      },
    ],
  },
];

// ─── Chapter 4 – Tia số & Số liền kề ─────────────────────────────────────────

const chapter4Lessons: Lesson[] = [
  {
    id: 401,
    chapterId: 4,
    title: "Tia số từ 0 đến 10",
    emoji: "📏",
    description: "Khám phá tia số và cách sắp xếp các số từ bé đến lớn.",
    status: "active",
    xpReward: 10,
    duration: 5,
    pos: [12, 72],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Điền các số còn thiếu trên tia số từ 0 đến 10!",
        emoji: "📏",
        xpReward: 3,
        numberLine: {
          start: 0,
          end: 10,
          missing: [3, 5, 7, 9],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm xem có bao nhiêu quả táo trên cây!",
        emoji: "🍎",
        xpReward: 2,
        objectCount: {
          objectEmoji: "🍎",
          count: 7,
          options: [5, 6, 7, 8],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Trên tia số, số nào đứng đầu tiên (nhỏ nhất)?",
        emoji: "📏",
        options: ["1", "0", "10", "5"],
        correctIndex: 1,
        hint: "Tia số bắt đầu từ vạch nào bên trái?",
        explanation:
          "Số 0 ở vạch đầu tiên, là số bé nhất trên tia số! 🎯",
        explanationDetail: {
          funFact:
            "Trên tia số, mỗi số cách đều nhau. Số 0 nằm ở đầu tiên bên trái!",
        },
      },
      {
        id: 2,
        type: "true-false",
        text: "Đúng hay Sai: Trên tia số, số đứng bên phải luôn lớn hơn số bên trái?",
        emoji: "👈👉",
        trueFalse: { isTrue: true },
        hint: "Nhìn tia số: 0, 1, 2, 3... số nào lớn hơn nằm ở đâu?",
        explanation:
          "ĐÚNG — Trên tia số, càng sang phải số càng lớn! 🌟",
        explanationDetail: {
          funFact:
            "Rô-bốt đã sắp xếp các số theo thứ tự từ bé đến lớn trên tia số — đây là quy tắc quan trọng!",
        },
      },
      {
        id: 3,
        text: "Số nào nằm giữa số 4 và số 6 trên tia số?",
        emoji: "🔢",
        options: ["3", "4", "5", "7"],
        correctIndex: 2,
        hint: "Đếm: 4, ?, 6 — số nào ở giữa?",
        explanation:
          "Số 5 nằm giữa 4 và 6 trên tia số! 🎉",
        explanationDetail: {
          funFact:
            "Trên tia số, các số liên tiếp cách nhau đúng 1 đơn vị!",
        },
      },
      {
        id: 4,
        type: "count-tap",
        text: "Trên tia số từ 0 đến 10, có bao nhiêu số chẵn?",
        emoji: "✌️",
        countTap: { targetCount: 6, label: "số chẵn", maxCount: 10 },
        hint: "Số chẵn: 0, 2, 4, 6, 8, 10 — hãy đếm!",
        explanation:
          "Có 6 số chẵn trên tia số từ 0 đến 10: 0, 2, 4, 6, 8, 10! 🏆",
        explanationDetail: {
          funFact:
            "Số chẵn là số chia hết cho 2. Trên tia số, chúng cách nhau 2 đơn vị!",
        },
      },
      {
        id: 5,
        type: "drag-match",
        text: "Nối mỗi số với vị trí đúng:",
        emoji: "🔗",
        dragMatch: {
          pairs: [
            { left: "Số bé nhất", right: "0" },
            { left: "Số lớn nhất (0-10)", right: "10" },
            { left: "Số giữa tia số", right: "5" },
            { left: "Số liền sau của 8", right: "9" },
          ],
        },
        hint: "Nhớ lại tia số từ 0 đến 10!",
        explanation:
          "Số bé nhất là 0, lớn nhất (0-10) là 10, ở giữa là 5, liền sau 8 là 9! ✨",
        explanationDetail: {
          funFact:
            "Tia số giúp ta biết thứ tự và so sánh các số dễ dàng!",
        },
      },
    ],
  },
  {
    id: 402,
    chapterId: 4,
    title: "Số liền trước",
    emoji: "⬅️",
    description: "Tìm hiểu cách xác định số liền trước trên tia số.",
    status: "locked",
    xpReward: 10,
    duration: 5,
    pos: [35, 53],
    games: [
      {
        id: 1,
        type: "fill-blank",
        instruction: "Số liền trước của 5 là mấy?",
        emoji: "⬅️",
        xpReward: 3,
        fillBlank: {
          question: "Số liền trước của 5 là ___",
          answer: 4,
          options: [3, 4, 5, 6],
        },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Số liền trước của 10 là mấy?",
        emoji: "⬅️",
        xpReward: 2,
        fillBlank: {
          question: "Số liền trước của 10 là ___",
          answer: 9,
          options: [8, 9, 10, 11],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Số liền trước của 4 là mấy?",
        emoji: "⬅️",
        options: ["2", "3", "4", "5"],
        correctIndex: 1,
        hint: "Nhìn tia số: ..., 2, 3, 4 — số nào đứng ngay trước 4?",
        explanation:
          "Số liền trước của 4 là 3! Vì trên tia số 3 đứng ngay trước 4. 🎯",
        explanationDetail: {
          funFact:
            "Số liền trước luôn nhỏ hơn 1 đơn vị. Liền trước của 4 là 4−1=3!",
        },
      },
      {
        id: 2,
        type: "true-false",
        text: "Đúng hay Sai: Số liền trước của 16 là 15?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "16 − 1 = ?",
        explanation:
          "ĐÚNG — Số liền trước của 16 là 15, vì 16 − 1 = 15! ✅",
        explanationDetail: {
          funFact:
            "Để tìm số liền trước, bé chỉ cần lấy số đó trừ đi 1!",
        },
      },
      {
        id: 3,
        type: "true-false",
        text: "Đúng hay Sai: Số liền trước của 18 là 17?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "18 − 1 = ?",
        explanation:
          "ĐÚNG — 18 − 1 = 17, nên số liền trước của 18 là 17! ✅",
        explanationDetail: {
          funFact:
            "Quy tắc: Số liền trước = Số đó − 1. Luôn đúng với mọi số!",
        },
      },
      {
        id: 4,
        text: "Số liền trước của 1 là mấy?",
        emoji: "⬅️",
        options: ["Không có", "0", "1", "2"],
        correctIndex: 1,
        hint: "Trên tia số: 0, 1, 2... số nào đứng trước 1?",
        explanation:
          "Số liền trước của 1 là 0! 🌟",
        explanationDetail: {
          funFact:
            "Số 0 là số nhỏ nhất trên tia số. Liền trước của 1 chính là 0!",
        },
      },
      {
        id: 5,
        type: "drag-match",
        text: "Nối mỗi số với số liền trước của nó:",
        emoji: "🔗",
        dragMatch: {
          pairs: [
            { left: "Liền trước của 7", right: "6" },
            { left: "Liền trước của 10", right: "9" },
            { left: "Liền trước của 3", right: "2" },
            { left: "Liền trước của 20", right: "19" },
          ],
        },
        hint: "Lấy mỗi số trừ đi 1!",
        explanation:
          "7→6, 10→9, 3→2, 20→19 — Số liền trước luôn bé hơn 1! 🏆",
        explanationDetail: {
          funFact:
            "Công thức đơn giản: Số liền trước = Số đó − 1!",
        },
      },
    ],
  },
  {
    id: 403,
    chapterId: 4,
    title: "Số liền sau",
    emoji: "➡️",
    description: "Tìm hiểu cách xác định số liền sau trên tia số.",
    status: "locked",
    xpReward: 10,
    duration: 5,
    pos: [58, 35],
    games: [
      {
        id: 1,
        type: "fill-blank",
        instruction: "Số liền sau của 7 là mấy?",
        emoji: "➡️",
        xpReward: 3,
        fillBlank: {
          question: "Số liền sau của 7 là ___",
          answer: 8,
          options: [6, 7, 8, 9],
        },
      },
      {
        id: 2,
        type: "fill-blank",
        instruction: "Số liền sau của 19 là mấy?",
        emoji: "➡️",
        xpReward: 2,
        fillBlank: {
          question: "Số liền sau của 19 là ___",
          answer: 20,
          options: [18, 19, 20, 21],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Số liền sau của 4 là mấy?",
        emoji: "➡️",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
        hint: "Nhìn tia số: 4, ?, ... — số nào đứng ngay sau 4?",
        explanation:
          "Số liền sau của 4 là 5! Vì trên tia số 5 đứng ngay sau 4. 🎯",
        explanationDetail: {
          funFact:
            "Số liền sau luôn lớn hơn 1 đơn vị. Liền sau của 4 là 4+1=5!",
        },
      },
      {
        id: 2,
        type: "true-false",
        text: "Đúng hay Sai: Số liền sau của 16 là 17?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "16 + 1 = ?",
        explanation:
          "ĐÚNG — 16 + 1 = 17, nên số liền sau của 16 là 17! ✅",
        explanationDetail: {
          funFact:
            "Để tìm số liền sau, bé chỉ cần lấy số đó cộng thêm 1!",
        },
      },
      {
        id: 3,
        type: "true-false",
        text: "Đúng hay Sai: Số liền sau của 18 là 19?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "18 + 1 = ?",
        explanation:
          "ĐÚNG — 18 + 1 = 19, nên số liền sau của 18 là 19! ✅",
        explanationDetail: {
          funFact:
            "Quy tắc: Số liền sau = Số đó + 1. Luôn đúng!",
        },
      },
      {
        id: 4,
        text: "Số liền sau của 1 là mấy?",
        emoji: "➡️",
        options: ["0", "1", "2", "3"],
        correctIndex: 2,
        hint: "Trên tia số: 0, 1, ?, 3... số nào đứng sau 1?",
        explanation:
          "Số liền sau của 1 là 2! 🌟",
        explanationDetail: {
          funFact:
            "1 + 1 = 2! Số liền sau luôn bằng số đó cộng thêm 1!",
        },
      },
      {
        id: 5,
        type: "drag-match",
        text: "Nối mỗi số với số liền sau của nó:",
        emoji: "🔗",
        dragMatch: {
          pairs: [
            { left: "Liền sau của 6", right: "7" },
            { left: "Liền sau của 9", right: "10" },
            { left: "Liền sau của 14", right: "15" },
            { left: "Liền sau của 0", right: "1" },
          ],
        },
        hint: "Lấy mỗi số cộng thêm 1!",
        explanation:
          "6→7, 9→10, 14→15, 0→1 — Số liền sau luôn lớn hơn 1! 🏆",
        explanationDetail: {
          funFact:
            "Công thức đơn giản: Số liền sau = Số đó + 1!",
        },
      },
    ],
  },
  {
    id: 404,
    chapterId: 4,
    title: "Tia số từ 10 đến 20",
    emoji: "🔢",
    description: "Mở rộng tia số và luyện tập với các số lớn hơn.",
    status: "locked",
    xpReward: 12,
    duration: 5,
    pos: [78, 55],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Điền các số còn thiếu trên tia số từ 10 đến 20!",
        emoji: "📏",
        xpReward: 3,
        numberLine: {
          start: 10,
          end: 20,
          missing: [12, 14, 17, 19],
        },
      },
      {
        id: 2,
        type: "object-count",
        instruction: "Đếm xem có bao nhiêu quả bóng!",
        emoji: "⚽",
        xpReward: 2,
        objectCount: {
          objectEmoji: "⚽",
          count: 15,
          options: [13, 14, 15, 16],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Số liền trước của 18 là bao nhiêu?",
        emoji: "⬅️",
        options: ["16", "17", "18", "19"],
        correctIndex: 1,
        hint: "18 − 1 = ?",
        explanation:
          "Số liền trước của 18 là 17! 🎯",
        explanationDetail: {
          funFact:
            "Dù số lớn hay nhỏ, quy tắc liền trước luôn giống nhau: trừ đi 1!",
        },
      },
      {
        id: 2,
        text: "Số liền sau của 18 là bao nhiêu?",
        emoji: "➡️",
        options: ["17", "18", "19", "20"],
        correctIndex: 2,
        hint: "18 + 1 = ?",
        explanation:
          "Số liền sau của 18 là 19! 🌟",
        explanationDetail: {
          funFact:
            "Quy tắc liền sau: cộng thêm 1! 18 + 1 = 19!",
        },
      },
      {
        id: 3,
        type: "true-false",
        text: "Đúng hay Sai: Số liền sau của 19 là 20?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "19 + 1 = ?",
        explanation:
          "ĐÚNG — 19 + 1 = 20! Số liền sau của 19 là 20! ✅",
        explanationDetail: {
          funFact:
            "20 là số lớn nhất trên tia số từ 10 đến 20!",
        },
      },
      {
        id: 4,
        type: "count-tap",
        text: "Trên tia số từ 10 đến 20, có bao nhiêu số lẻ?",
        emoji: "🔢",
        countTap: { targetCount: 5, label: "số lẻ", maxCount: 10 },
        hint: "Số lẻ: 11, 13, 15, 17, 19 — hãy đếm!",
        explanation:
          "Có 5 số lẻ: 11, 13, 15, 17, 19! 🏆",
        explanationDetail: {
          funFact:
            "Số lẻ là số không chia hết cho 2. Trên tia số, chúng xen kẽ với số chẵn!",
        },
      },
      {
        id: 5,
        type: "drag-match",
        text: "Nối mỗi quả bóng với vạch đúng trên tia số:",
        emoji: "⚽",
        dragMatch: {
          pairs: [
            { left: "10 + 2", right: "12" },
            { left: "10 + 7", right: "17" },
            { left: "10 + 5", right: "15" },
            { left: "0 + 1", right: "1" },
          ],
        },
        hint: "Tính phép cộng để biết vị trí trên tia số!",
        explanation:
          "10+2=12, 10+7=17, 10+5=15, 0+1=1! Ghép đúng hết rồi! ✨",
        explanationDetail: {
          funFact:
            "Trên tia số, mỗi phép cộng cho ta biết vị trí chính xác của số!",
        },
      },
    ],
  },
  {
    id: 405,
    chapterId: 4,
    title: "Thử thách tia số",
    emoji: "🏆",
    description: "Bài tổng hợp kiểm tra kiến thức về tia số và số liền kề!",
    status: "locked",
    xpReward: 15,
    duration: 6,
    pos: [88, 75],
    games: [
      {
        id: 1,
        type: "number-line",
        instruction: "Điền các số còn thiếu trên tia số từ 0 đến 10!",
        emoji: "📏",
        xpReward: 3,
        numberLine: {
          start: 0,
          end: 10,
          missing: [1, 4, 6, 8],
        },
      },
      {
        id: 2,
        type: "number-line",
        instruction: "Điền số còn thiếu trên tia số từ 10 đến 20!",
        emoji: "🔢",
        xpReward: 3,
        numberLine: {
          start: 10,
          end: 20,
          missing: [11, 13, 16, 18],
        },
      },
    ],
    questions: [
      {
        id: 1,
        text: "Số liền trước của 1 và số liền sau của 1 lần lượt là?",
        emoji: "🎯",
        options: ["0 và 1", "0 và 2", "1 và 2", "1 và 3"],
        correctIndex: 1,
        hint: "Liền trước: 1−1=?, Liền sau: 1+1=?",
        explanation:
          "Liền trước của 1 là 0, liền sau của 1 là 2! 🏆",
        explanationDetail: {
          funFact:
            "Số liền trước bé hơn 1, số liền sau lớn hơn 1. Hai quy tắc đơn giản mà rất hữu ích!",
        },
      },
      {
        id: 2,
        type: "true-false",
        text: "Đúng hay Sai: Số liền trước của 1 là 0?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "1 − 1 = ?",
        explanation:
          "ĐÚNG — 1 − 1 = 0, nên số liền trước của 1 là 0! ✅",
        explanationDetail: {
          funFact:
            "Đây chính là bài tập Đ, S trong sách giáo khoa!",
        },
      },
      {
        id: 3,
        text: "Ghép đúng: Quả bóng ghi '10 + 2' nằm ở vạch nào trên tia số?",
        emoji: "⚽",
        options: ["10", "11", "12", "13"],
        correctIndex: 2,
        hint: "10 + 2 = ?",
        explanation:
          "10 + 2 = 12! Quả bóng nằm ở vạch 12 trên tia số! ⚽",
        explanationDetail: {
          funFact:
            "Trên tia số, bé có thể đặt phép tính vào đúng vị trí kết quả!",
        },
      },
      {
        id: 4,
        type: "true-false",
        text: "Đúng hay Sai: Số liền sau của 16 là 17?",
        emoji: "🤔",
        trueFalse: { isTrue: true },
        hint: "16 + 1 = ?",
        explanation:
          "ĐÚNG — 16 + 1 = 17! ✅",
        explanationDetail: {
          funFact:
            "Bé đã thuộc quy tắc rồi: liền sau = số đó + 1!",
        },
      },
      {
        id: 5,
        type: "drag-match",
        text: "Thử thách cuối: Nối đúng số liền trước và liền sau!",
        emoji: "🏆",
        dragMatch: {
          pairs: [
            { left: "Liền trước của 16", right: "15" },
            { left: "Liền sau của 18", right: "19" },
            { left: "Liền trước của 1", right: "0" },
            { left: "Liền sau của 1", right: "2" },
          ],
        },
        hint: "Liền trước: trừ 1. Liền sau: cộng 1!",
        explanation:
          "16→15, 18→19, 1→0, 1→2 — Bé giỏi quá! 🏆🎉",
        explanationDetail: {
          funFact:
            "Bé đã hoàn thành bài tổng hợp! Tia số không còn là thử thách nữa rồi! 🌟",
        },
      },
    ],
  },
];

// ─── All Chapters ─────────────────────────────────────────────────────────────

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Hình học 3D",
    emoji: "📦",
    description: "Khám phá thế giới hình khối 3D kỳ diệu!",
    color: "bg-sky-400",
    accent: "text-sky-700",
    shadow: "shadow-[0_6px_0_#0369a1]",
    lessons: chapter1Lessons,
  },
  {
    id: 2,
    title: "Phép cộng",
    emoji: "➕",
    description: "Học phép cộng từ cơ bản đến nâng cao!",
    color: "bg-green-400",
    accent: "text-green-700",
    shadow: "shadow-[0_6px_0_#15803d]",
    lessons: chapter2Lessons,
  },
  {
    id: 3,
    title: "Phép trừ",
    emoji: "➖",
    description: "Chinh phục phép trừ thú vị!",
    color: "bg-purple-400",
    accent: "text-purple-700",
    shadow: "shadow-[0_6px_0_#7e22ce]",
    lessons: chapter3Lessons,
  },
  {
    id: 4,
    title: "Tia số & Số liền kề",
    emoji: "📏",
    description: "Khám phá tia số, số liền trước và số liền sau!",
    color: "bg-orange-400",
    accent: "text-orange-700",
    shadow: "shadow-[0_6px_0_#c2410c]",
    lessons: chapter4Lessons,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLessonById(id: number): Lesson | undefined {
  for (const chapter of CHAPTERS) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getChapterByLessonId(lessonId: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.lessons.some((l) => l.id === lessonId));
}

// XP stored in localStorage
export const STUDENT_XP_KEY = "vio_student_xp";
export const STUDENT_COMPLETED_KEY = "vio_student_completed"; // JSON array of lessonIds

export function getTotalXP(): number {
  return Number(localStorage.getItem(STUDENT_XP_KEY) ?? 0);
}

export function getCompletedLessons(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_COMPLETED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markLessonComplete(lessonId: number, xp: number) {
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(STUDENT_COMPLETED_KEY, JSON.stringify(completed));
    const total = getTotalXP() + xp;
    localStorage.setItem(STUDENT_XP_KEY, String(total));
  }
}

// ── Active child plan helper ──────────────────────────────────────────────────

import {
  CHILD_PROFILES_STORAGE_KEY,
  ACTIVE_CHILD_ID_KEY,
  type PlanType,
  type ChildProfile as DashChildProfile,
} from "@/shared/api/dashboardMockData";

export function getActiveChildPlan(): PlanType {
  try {
    const activeId = localStorage.getItem(ACTIVE_CHILD_ID_KEY);
    const raw = localStorage.getItem(CHILD_PROFILES_STORAGE_KEY);
    if (raw && activeId) {
      const profiles = JSON.parse(raw) as DashChildProfile[];
      const match = profiles.find((p) => p.id === activeId);
      if (match) return match.plan;
    }
  } catch {
    /* ignore */
  }
  return "FREE";
}

// ── Plan-based access control ─────────────────────────────────────────────────

/** Chapter IDs accessible per plan */
const PLAN_ACCESS: Record<PlanType, number[]> = {
  FREE: [1], // Chapter 1 only
  PRO: [1, 2, 4], // Chapters 1, 2 & 4
  VIP: [1, 2, 3, 4], // All chapters
};

/** Max lessons per chapter for FREE plan */
const FREE_LESSON_LIMIT = 3;

export function getAccessibleChapterIds(plan: PlanType): number[] {
  return PLAN_ACCESS[plan];
}

export function isLessonAccessible(lessonId: number, plan: PlanType): boolean {
  const chapter = getChapterByLessonId(lessonId);
  if (!chapter) return false;
  if (!PLAN_ACCESS[plan].includes(chapter.id)) return false;
  if (plan === "FREE") {
    const idx = chapter.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= FREE_LESSON_LIMIT) return false;
  }
  return true;
}

/** Get all games across all chapters grouped by chapter */
export function getAllGames(): {
  chapter: Chapter;
  games: { lesson: Lesson; game: GameActivity }[];
}[] {
  return CHAPTERS.map((chapter) => ({
    chapter,
    games: chapter.lessons.flatMap((lesson) =>
      lesson.games.map((game) => ({ lesson, game })),
    ),
  }));
}

/** Get all quizzes across all chapters grouped by chapter */
export function getAllQuizzes(): {
  chapter: Chapter;
  quizzes: { lesson: Lesson; questionCount: number }[];
}[] {
  return CHAPTERS.map((chapter) => ({
    chapter,
    quizzes: chapter.lessons.map((lesson) => ({
      lesson,
      questionCount: lesson.questions.length,
    })),
  }));
}

// ── Game progress in localStorage ─────────────────────────────────────────────
const STUDENT_GAME_COMPLETED_KEY = "vio_student_game_completed";

export function getCompletedGames(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_GAME_COMPLETED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function markGameComplete(lessonId: number, xp: number) {
  const completed = getCompletedGames();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(STUDENT_GAME_COMPLETED_KEY, JSON.stringify(completed));
    const total = getTotalXP() + xp;
    localStorage.setItem(STUDENT_XP_KEY, String(total));
  }
}
