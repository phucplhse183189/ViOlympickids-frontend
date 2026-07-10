import { apiGet } from "@/shared/api/client";

export interface AnalyticsStats {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  viewsToday: number;
  dailyViews: Array<{ date: string; views: number; visitors: number }>;
  topPages: Array<{ path: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

export async function getAnalyticsStats(days = 30): Promise<AnalyticsStats> {
  return apiGet<AnalyticsStats>(`/admin/analytics-stats?days=${days}`);
}
