export interface FeedbackReply {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar: string;
}

export interface FeedbackPost {
  id: string;
  rating: number;
  content: string;
  likesCount: number;
  createdAt: string;
  authorName: string;
  authorAvatar: string;
  replies: FeedbackReply[];
}
