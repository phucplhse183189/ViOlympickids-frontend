import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db.js";
import { feedbackPosts } from "../../src/shared/db/schema.js";
import { and, eq, gte, sql } from "drizzle-orm";

const CATEGORIES = ["interface", "feature", "content", "performance", "support", "general"] as const;

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { content, rating, category = "general" } = req.body || {};
  if (!content) return res.status(400).json({ error: "Content is required" });
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category" });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5" });

  try {
    const duplicate = await db.select({ id: feedbackPosts.id }).from(feedbackPosts).where(and(eq(feedbackPosts.userId, userId), eq(feedbackPosts.category, category), gte(feedbackPosts.createdAt, new Date(Date.now() - 10 * 60 * 1000)), sql`lower(trim(${feedbackPosts.content})) = lower(trim(${content}))`)).limit(1);
    if (duplicate.length) return res.status(409).json({ error: "Feedback này vừa được gửi. Vui lòng không gửi lại nội dung trùng." });
    const newFeedback = await db
      .insert(feedbackPosts)
      .values({
        userId,
        content,
        rating,
        category,
        status: "pending",
      })
      .returning();

    return res.status(200).json({ success: true, data: newFeedback[0] });
  } catch (error: any) {
    console.error("Feedback submit error:", error);
    return res.status(500).json({ error: error.message });
  }
}
