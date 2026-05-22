/**
 * ============================================================
 *  Types – Bài học & Câu hỏi trắc nghiệm
 *  Các kiểu dữ liệu cho Toán Lớp 2: chủ đề, bài học, quiz.
 * ============================================================
 */

import type { PlanType } from "./dashboard";

// ── Loại game ────────────────────────────────────────────────

/**
 * gameType quyết định component game nào sẽ mở khi click vào bài học.
 * - "number-sequence-chart": Bài 2 — lý thuyết rồi game dãy số
 * - "math2-quiz-3d": Phòng thí nghiệm khối 3D (Bài 46)
 * - "number-review-game": Ôn tập số (Bài 1)
 * - "add-across-ten-game": Phép cộng qua 10 trong phạm vi 20 (Bài 7)
 * - "pipe-balance-game": Game nối ống cân bằng (Bài 5)
 * - "matific-canvas-game": Game kéo thả kiểu Matific (Bài 6)
 * - null: chưa có game (hiển thị "Sắp ra mắt")
 */
export type GameType =
  | "number-sequence-chart"
  | "math2-quiz-3d"
  | "number-review-game"
  | "add-across-ten-game"
  | "pipe-balance-game"
  | "matific-canvas-game"
  | null;

// ── Bài học Toán Lớp 2 ──────────────────────────────────────

export interface Math2Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  gameType: GameType;
  emoji: string;
  description: string;
  /** Gói tối thiểu cần để truy cập bài học này */
  requiredPlan: PlanType;
}

// ── Chủ đề Toán Lớp 2 ───────────────────────────────────────

export interface Math2Topic {
  id: string;
  topicNumber: number;
  title: string;
  color: string; // tailwind gradient classes
  accent: string; // tailwind text color
  emoji: string;
  lessons: Math2Lesson[];
}

// ── Câu hỏi trắc nghiệm ────────────────────────────────────

export interface Math2QuizQuestion {
  id: number;
  question: string;
  /** Gợi ý trực quan hiển thị phía trên câu hỏi (VD: trục số) */
  visual?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
