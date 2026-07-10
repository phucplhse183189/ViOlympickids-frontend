import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const postId = req.query.id as string;
      const { content } = req.body;

      if (!postId || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { rows } = await sql`
        INSERT INTO feedback_replies (post_id, user_id, content)
        VALUES (${postId}, ${userId}, ${content})
        RETURNING id, content, created_at as "createdAt"
      `;

      // Fetch author info to return complete object
      const { rows: userRows } = await sql`
        SELECT name, avatar_emoji FROM users WHERE id = ${userId}
      `;

      const newReply = {
        ...rows[0],
        authorName: userRows[0]?.name || "Parent",
        authorAvatar: userRows[0]?.avatar_emoji || "🦊",
      };

      return res.status(201).json(newReply);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in feedback reply API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
