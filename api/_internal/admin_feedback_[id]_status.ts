import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db.js";
import { feedbackPosts } from "../../src/shared/db/schema.js";
import { eq } from "drizzle-orm";

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });
  
  const id = req.query.id as string;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    const updated = await db
      .update(feedbackPosts)
      .set({ status })
      .where(eq(feedbackPosts.id, id))
      .returning();

    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error("Admin feedback update error:", error);
    return res.status(500).json({ error: error.message });
  }
}
