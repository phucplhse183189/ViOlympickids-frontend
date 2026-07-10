import { apiGet, apiPost } from "@/shared/api/client";

// ── Types ────────────────────────────────────────────────────────────────────

/** Một dòng trên bảng xếp hạng */
export interface LeaderboardEntry {
  rank: number;
  childId: string;
  name: string;
  avatarEmoji: string;
  avatarBg: string | null;
  score: number;
  totalQuestions: number;
  attemptNumber: number;
  completedAt: string;
}

/** Response từ API leaderboard */
export interface LeaderboardResponse {
  top10: LeaderboardEntry[];
  myRank: LeaderboardEntry | null; // null = chưa tham gia quiz này
  totalParticipants: number;
}

/** Bài học có quiz (dùng cho quiz selector) */
export interface QuizLesson {
  id: string;
  title: string;
  emoji: string | null;
  topicTitle: string;
}

// ── API Calls ────────────────────────────────────────────────────────────────

/**
 * Lấy bảng xếp hạng của 1 bài quiz
 * @param lessonId – ID bài học
 * @param childId  – ID bé đang đăng nhập (để tính rank cá nhân)
 */
export async function getLeaderboard(
  lessonId: string,
  childId: string,
): Promise<LeaderboardResponse> {
  return apiGet<LeaderboardResponse>(
    `/leaderboard/${lessonId}?childId=${childId}`,
  );
}

/**
 * Gửi kết quả quiz (sau khi bé hoàn thành)
 */
export async function submitAttempt(
  childId: string,
  lessonId: string,
  score: number,
  totalQuestions: number,
): Promise<void> {
  await apiPost("/leaderboard/submit", {
    childId,
    lessonId,
    score,
    totalQuestions,
  });
}

/**
 * Lấy danh sách bài học có quiz (cho Quiz Selector)
 */
export async function getQuizLessons(): Promise<QuizLesson[]> {
  return apiGet<QuizLesson[]>("/leaderboard/lessons");
}
