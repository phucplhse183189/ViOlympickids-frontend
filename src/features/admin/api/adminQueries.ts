import { useQuery } from "@tanstack/react-query";
import * as adminService from "./adminService";
import { getAnalyticsStats } from "./adminAnalytics";
import { getFeedbacks } from "./adminFeedbackService";

export const adminQueryKeys = {
  stats: ["admin", "stats"] as const,
  parents: ["admin", "parents"] as const,
  finance: ["admin", "finance"] as const,
  lessons: ["admin", "lessons"] as const,
  feedback: ["admin", "feedback"] as const,
  leaderboard: ["admin", "leaderboard"] as const,
  analytics: (days: number) => ["admin", "analytics", days] as const,
};

export const adminQueryOptions = {
  stats: () => ({ queryKey: adminQueryKeys.stats, queryFn: adminService.getStats }),
  parents: () => ({ queryKey: adminQueryKeys.parents, queryFn: adminService.getParents }),
  finance: () => ({ queryKey: adminQueryKeys.finance, queryFn: adminService.getFinanceStats }),
  lessons: () => ({ queryKey: adminQueryKeys.lessons, queryFn: adminService.getAdminLessons }),
  feedback: () => ({ queryKey: adminQueryKeys.feedback, queryFn: getFeedbacks }),
  leaderboard: () => ({ queryKey: adminQueryKeys.leaderboard, queryFn: adminService.getLeaderboardAttempts }),
  analytics: (days = 30) => ({ queryKey: adminQueryKeys.analytics(days), queryFn: () => getAnalyticsStats(days) }),
};

export function useAdminStatsQuery() { return useQuery(adminQueryOptions.stats()); }
export function useAdminParentsQuery() { return useQuery(adminQueryOptions.parents()); }
export function useAdminFinanceQuery() { return useQuery(adminQueryOptions.finance()); }
export function useAdminLessonsQuery() { return useQuery(adminQueryOptions.lessons()); }
export function useAdminFeedbackQuery() { return useQuery(adminQueryOptions.feedback()); }
export function useAdminLeaderboardQuery() { return useQuery(adminQueryOptions.leaderboard()); }
export function useAdminAnalyticsQuery(days = 30) { return useQuery(adminQueryOptions.analytics(days)); }
