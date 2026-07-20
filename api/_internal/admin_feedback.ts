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
        category: feedbackPosts.category,
        status: feedbackPosts.status,
        createdAt: feedbackPosts.createdAt,
        userId: users.id,
        userName: users.name,
        userPhone: users.phone,
        avatarInitials: users.avatarInitials,
      })
      .from(feedbackPosts)
      .leftJoin(users, eq(feedbackPosts.userId, users.id))
      .orderBy(desc(feedbackPosts.createdAt));

    return res.status(200).json(feedbacks);
  } catch (error: any) {
    console.error("Admin feedback fetch error:", error);
    return res.status(500).json({ error: error.message });
  }
}
