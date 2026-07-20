import { apiGet, apiPut } from "@/shared/api/client";

export type FeedbackStatus = "pending" | "public" | "hidden" | "resolved";
export type FeedbackCategory = "interface" | "feature" | "content" | "performance" | "support" | "general";

export interface AdminFeedback {
  id: string;
  content: string;
  rating: number;
  category: FeedbackCategory;
  status: FeedbackStatus;
  createdAt: string;
  userId: string;
  userName: string;
  userPhone: string;
  avatarInitials: string;
}

export async function getFeedbacks(): Promise<AdminFeedback[]> {
  return apiGet<AdminFeedback[]>("/admin/feedback");
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<AdminFeedback> {
  const res = await apiPut<{ success: boolean; data: AdminFeedback }>(`/admin/feedback/${id}/status`, { status });
  return res.data;
}
