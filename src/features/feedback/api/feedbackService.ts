import { apiGet, apiPost } from "@/shared/api/client";
import type { FeedbackPost, FeedbackReply } from "../types";

export async function getFeedbacks(): Promise<FeedbackPost[]> {
  return apiGet<FeedbackPost[]>("/feedback/public");
}

export async function submitFeedback(rating: number, content: string): Promise<FeedbackPost> {
  return apiPost<FeedbackPost>("/feedback", { rating, content });
}

export async function replyToFeedback(postId: string, content: string): Promise<FeedbackReply> {
  return apiPost<FeedbackReply>(`/feedback/${postId}/reply`, { content });
}

export async function toggleLikeFeedback(postId: string): Promise<{ liked: boolean }> {
  return apiPost<{ liked: boolean }>(`/feedback/${postId}/like`, {});
}
