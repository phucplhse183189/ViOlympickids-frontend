import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db.js";
import { feedbackPosts, users } from "../../src/shared/db/schema.js";
import { eq, desc } from "drizzle-orm";

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  
  try {
    const feedbacks = await db
      .select({
        id: feedbackPosts.id,
        content: feedbackPosts.content,
        rating: feedbackPosts.rating,
        likesCount: feedbackPosts.likesCount,
        createdAt: feedbackPosts.createdAt,
        authorName: users.name,
        authorAvatar: users.avatarInitials,
      })
      .from(feedbackPosts)
      .leftJoin(users, eq(feedbackPosts.userId, users.id))
      .where(eq(feedbackPosts.status, "public"))
      .orderBy(desc(feedbackPosts.createdAt));

    // We can return replies as empty array for now, or fetch them if needed.
    const formatted = feedbacks.map((fb) => ({
      ...fb,
      authorName: fb.authorName || "Phụ huynh Ẩn danh",
      authorAvatar: fb.authorAvatar || "fox",
      replies: [],
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error("Public feedback fetch error:", error);
    return res.status(500).json({ error: error.message });
  }
}
