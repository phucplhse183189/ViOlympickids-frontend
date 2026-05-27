
import type { PlanType } from "@/shared/types/dashboard";

const PLAN_RANK: Record<PlanType, number> = {
  FREE: 1,
  PRO: 2,
  VIP: 3,
};

export function canAccessLesson(
  lesson: { requiredPlan: PlanType },
  userPlan: PlanType,
): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[lesson.requiredPlan];
}

export function getMath2LessonPlayRoute(lesson: { gameType: string | null }): string | null {
  if (!lesson.gameType) return null;
  switch (lesson.gameType) {
    case "number-review-game":
      return "/student/game/math2-b1";
    case "add-across-ten-game":
      return "/student/game/math2-b7";
    case "pipe-balance-game":
      return "/student/game/pipe-balance";
    case "number-sequence-chart":
      return "/student/theory/math2-b2";
    case "math2-quiz-3d":
      return "/student/game/math2-quiz-3d-shapes";
    default:
      return `/student/game/${lesson.gameType}`;
  }
}
