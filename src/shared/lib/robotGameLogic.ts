// ─── Robot Phiêu Lưu Trong Thế Giới Số ─────────────────────────────────────
// Game logic & data cho Bài 2: Tia số – Số liền trước – Số liền sau

/** Sinh random int trong [min, max] */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Shuffle mảng (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Map 1: Vườn Táo Số ──────────────────────────────────────────────────────
// Đặt số đúng vị trí trên tia số

export interface AppleNumberPuzzle {
  /** Tia số: mảng các vị trí, mỗi vị trí có giá trị thật */
  numberLine: number[];
  /** Index các vị trí cần điền (đã bị gỡ) */
  missingIndices: number[];
  /** Các số "táo" rơi xuống, cần kéo vào đúng vị trí (shuffled) */
  appleNumbers: number[];
}

export function generateApplePuzzle(difficulty: number): AppleNumberPuzzle {
  const start = randInt(0, difficulty <= 1 ? 10 : 40);
  const step = difficulty <= 1 ? 1 : difficulty <= 2 ? 2 : 5;
  const len = 8;
  const numberLine = Array.from({ length: len }, (_, i) => start + i * step);
  const count = difficulty <= 1 ? 2 : 3;
  const candidates = Array.from({ length: len - 2 }, (_, i) => i + 1); // avoid first & last
  const missingIndices = shuffle(candidates).slice(0, count).sort((a, b) => a - b);
  const appleNumbers = shuffle(missingIndices.map((i) => numberLine[i]));
  return { numberLine, missingIndices, appleNumbers };
}

// ─── Map 2: Cây Cầu Số ──────────────────────────────────────────────────────
// Robot nhảy qua các bậc đá theo số liền sau

export interface BridgePuzzle {
  /** Dãy các bậc đá, mỗi bậc hiển thị một số */
  stones: number[];
  /** Index bậc đá có dấu hỏi (cần chọn đúng) */
  missingIndex: number;
  /** Đáp án đúng */
  correctAnswer: number;
  /** 3 lựa chọn (gồm đáp án) */
  options: number[];
  /** Kiểu: "next" (liền sau) hoặc "prev" (liền trước) */
  type: "next" | "prev";
}

export function generateBridgePuzzle(difficulty: number): BridgePuzzle {
  const step = difficulty <= 1 ? 1 : difficulty <= 2 ? 2 : 5;
  const start = randInt(0, 80);
  const len = 6;
  const stones = Array.from({ length: len }, (_, i) => start + i * step);
  const missingIndex = randInt(1, len - 2);
  const correctAnswer = stones[missingIndex];
  // Tạo 2 đáp án sai gần đúng
  const wrong1 = correctAnswer + step;
  const wrong2 = correctAnswer - step;
  const options = shuffle([correctAnswer, wrong1, Math.max(0, wrong2)]);
  const type = Math.random() > 0.5 ? "next" : "prev";
  return { stones, missingIndex, correctAnswer, options, type };
}

// ─── Map 3: Đường Ray Tàu Số ────────────────────────────────────────────────
// Đẩy toa tàu điền số thiếu vào dãy

export interface TrainPuzzle {
  /** Dãy số đầy đủ */
  fullSequence: number[];
  /** Index toa bị thiếu */
  missingIndices: number[];
  /** Các toa tàu cần kéo vào (shuffled) */
  trainCars: number[];
}

export function generateTrainPuzzle(difficulty: number): TrainPuzzle {
  const start = randInt(1, difficulty <= 1 ? 20 : 60);
  const step = difficulty <= 1 ? 1 : difficulty <= 2 ? 2 : 5;
  const len = 7;
  const fullSequence = Array.from({ length: len }, (_, i) => start + i * step);
  const count = difficulty <= 1 ? 2 : 3;
  const candidates = Array.from({ length: len - 2 }, (_, i) => i + 1);
  const missingIndices = shuffle(candidates).slice(0, count).sort((a, b) => a - b);
  const trainCars = shuffle(missingIndices.map((i) => fullSequence[i]));
  return { fullSequence, missingIndices, trainCars };
}

// ─── Map 4: Thành Phố Bóng Bay ──────────────────────────────────────────────
// Bóng bay mang số bay loạn, kéo về đúng vị trí

export interface BalloonPuzzle {
  /** Dãy đích: tia số */
  numberLine: number[];
  /** Index vị trí cần điền */
  missingIndices: number[];
  /** Bóng bay (cần kéo vào) */
  balloons: { id: number; value: number; color: string }[];
}

const BALLOON_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A855F7",
  "#3B82F6", "#F472B6", "#34D399", "#FB923C",
];

export function generateBalloonPuzzle(difficulty: number): BalloonPuzzle {
  const start = randInt(0, difficulty <= 1 ? 15 : 50);
  const step = difficulty <= 1 ? 1 : difficulty <= 2 ? 2 : 5;
  const len = 8;
  const numberLine = Array.from({ length: len }, (_, i) => start + i * step);
  const count = difficulty <= 1 ? 2 : difficulty <= 2 ? 3 : 4;
  const candidates = Array.from({ length: len - 2 }, (_, i) => i + 1);
  const missingIndices = shuffle(candidates).slice(0, count).sort((a, b) => a - b);
  const balloons = shuffle(
    missingIndices.map((i, idx) => ({
      id: idx,
      value: numberLine[i],
      color: BALLOON_COLORS[idx % BALLOON_COLORS.length],
    })),
  );
  return { numberLine, missingIndices, balloons };
}

// ─── Map 5: Đường Đua Thỏ ───────────────────────────────────────────────────
// Sắp xếp thỏ mang số theo thứ tự tăng dần

export interface RabbitPuzzle {
  /** Các con thỏ, mỗi con mang 1 số, cần sắp xếp đúng */
  rabbits: { id: number; value: number; color: string }[];
  /** Thứ tự đúng (sorted values) */
  correctOrder: number[];
}

const RABBIT_COLORS = ["#F472B6", "#34D399", "#60A5FA", "#FBBF24", "#A78BFA", "#FB923C"];

export function generateRabbitPuzzle(difficulty: number): RabbitPuzzle {
  const count = difficulty <= 1 ? 4 : difficulty <= 2 ? 5 : 6;
  const step = difficulty <= 1 ? 1 : difficulty <= 2 ? 2 : randInt(3, 5);
  const start = randInt(1, difficulty <= 1 ? 20 : 60);
  const correctOrder = Array.from({ length: count }, (_, i) => start + i * step);
  const rabbits = shuffle(
    correctOrder.map((v, i) => ({
      id: i,
      value: v,
      color: RABBIT_COLORS[i % RABBIT_COLORS.length],
    })),
  );
  return { rabbits, correctOrder };
}

// ─── Map metadata ─────────────────────────────────────────────────────────────

export interface MapInfo {
  id: number;
  name: string;
  emoji: string;
  description: string;
  bgGradient: string;
  unlocked: boolean;
}

export const MAPS: MapInfo[] = [
  {
    id: 1,
    name: "Vườn Táo Số",
    emoji: "🍎",
    description: "Đặt số đúng vị trí trên tia số",
    bgGradient: "from-green-300 via-emerald-200 to-lime-100",
    unlocked: true,
  },
  {
    id: 2,
    name: "Cây Cầu Số",
    emoji: "🌉",
    description: "Nhảy qua bậc đá theo số liền sau",
    bgGradient: "from-sky-300 via-blue-200 to-cyan-100",
    unlocked: true,
  },
  {
    id: 3,
    name: "Đường Ray Tàu Số",
    emoji: "🚂",
    description: "Hoàn thành dãy số trên đường ray",
    bgGradient: "from-amber-300 via-yellow-200 to-orange-100",
    unlocked: true,
  },
  {
    id: 4,
    name: "Thành Phố Bóng Bay",
    emoji: "🎈",
    description: "Kéo bóng bay về đúng vị trí",
    bgGradient: "from-pink-300 via-rose-200 to-fuchsia-100",
    unlocked: true,
  },
  {
    id: 5,
    name: "Đường Đua Thỏ",
    emoji: "🐰",
    description: "Sắp xếp thỏ theo thứ tự số",
    bgGradient: "from-violet-300 via-purple-200 to-indigo-100",
    unlocked: true,
  },
];

// ─── Robot dialogue ───────────────────────────────────────────────────────────

export const ROBOT_GREETINGS = [
  "Xin chào bạn nhỏ! 🤖",
  "Mình là Tí Tách đây! ⚡",
  "Chúng ta cùng phiêu lưu nhé! 🚀",
];

export const ROBOT_CORRECT = [
  "Wow! Chuẩn không cần chỉnh! 🌟",
  "Đúng phóc rồi! Con giỏi quá! 🎉",
  "Xuất sắc! Tiếp tục nhé! ⭐",
  "Bạn thông minh lắm! 🧠",
  "Chính xác! Tí Tách rất vui! 🤖✨",
];

export const ROBOT_WRONG = [
  "Ôi, sai một xíu thôi. Tính lại nhé! 💪",
  "Chưa đúng mất rồi. Thử lại tẹo nha! 🌈",
  "Đừng lo, thử lại một lần nữa! 😊",
];

export const ROBOT_HINTS: Record<number, string[]> = {
  1: [
    "Hãy nhìn các số trên tia số, chúng tăng đều đặn!",
    "Kéo quả táo vào ô trống tương ứng nhé!",
  ],
  2: [
    "Số liền sau lớn hơn 1 đơn vị!",
    "Số liền trước nhỏ hơn 1 đơn vị!",
  ],
  3: [
    "Hãy tìm quy luật của dãy số!",
    "Kéo toa tàu vào đúng vị trí nhé!",
  ],
  4: [
    "Bóng bay mang số mấy? Nó cần về vị trí nào?",
    "Nhìn các số xung quanh để tìm vị trí đúng!",
  ],
  5: [
    "Sắp xếp từ bé đến lớn nhé!",
    "Kéo thỏ mang số nhỏ nhất lên trước!",
  ],
};

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
