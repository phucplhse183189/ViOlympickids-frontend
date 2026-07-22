import { apiGet, apiPost } from "@/shared/api/client";

/** Bài học */
export interface Lesson {
  id: string;
  topicId: string;
  lessonNumber: number;
  title: string;
  gameType: string | null;
  emoji: string | null;
  description: string | null;
  requiredPlan: "FREE" | "PRO" | "VIP";
}

/** Chủ đề kèm danh sách bài học */
export interface TopicWithLessons {
  id: string;
  topicNumber: number;
  title: string;
  color: string | null;
  accent: string | null;
  emoji: string | null;
  lessons: Lesson[];
}

/** Câu hỏi quiz */
export interface QuizQuestion {
  id: string;
  lessonId: string;
  questionNumber: number;
  question: string;
  visual: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

/** Bản ghi hoàn thành bài học */
export interface CompletedRecord {
  id: string;
  childId: string;
  lessonId: string;
  completedAt: string;
}

export interface StudentMapResponse {
  topics: TopicWithLessons[];
  completedLessonIds: string[];
  student: { id: string; plan: "FREE" | "PRO" | "VIP"; status: string };
  generatedAt: string;
}

export async function getStudentMap(childId: string, signal?: AbortSignal): Promise<StudentMapResponse> {
  return apiGet<StudentMapResponse>(`/lessons/map?childId=${encodeURIComponent(childId)}`, { signal, ttlMs: 0 });
}

/**
 * Lấy tất cả chủ đề kèm bài học
 */
export async function getTopics(): Promise<TopicWithLessons[]> {
  return apiGet<TopicWithLessons[]>("/lessons/topics");
}

/**
 * Lấy câu hỏi quiz của bài học
 */
export async function getQuiz(lessonId: string): Promise<QuizQuestion[]> {
  return apiGet<QuizQuestion[]>(`/lessons/${lessonId}/quiz`);
}

/**
 * Đánh dấu hoàn thành bài học
 */
export async function markCompleted(
  childId: string,
  lessonId: string
): Promise<CompletedRecord> {
  return apiPost<CompletedRecord>(`/lessons/${lessonId}/complete`, { childId });
}

/**
 * Lấy danh sách lessonId đã hoàn thành của bé
 */
export async function getCompleted(childId: string): Promise<string[]> {
  return apiGet<string[]>(`/lessons/completed?childId=${childId}`);
}
