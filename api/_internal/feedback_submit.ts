import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db.js";
import { feedbackPosts } from "../../src/shared/db/schema.js";

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { content, rating } = req.body || {};
  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    const newFeedback = await db
      .insert(feedbackPosts)
      .values({
        userId,
        content,
        rating: rating || 5,
        status: "pending",
      })
      .returning();

    return res.status(200).json({ success: true, data: newFeedback[0] });
  } catch (error: any) {
    console.error("Feedback submit error:", error);
    return res.status(500).json({ error: error.message });
  }
}
