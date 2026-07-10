import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const postId = req.query.id as string;
      if (!postId) return res.status(400).json({ error: "Missing post id" });

      // Check if already liked
      const { rows: existingLikes } = await sql`
        SELECT id FROM feedback_likes 
        WHERE post_id = ${postId} AND user_id = ${userId}
      `;

      if (existingLikes.length > 0) {
        // Unlike
        await sql`
          DELETE FROM feedback_likes 
          WHERE post_id = ${postId} AND user_id = ${userId}
        `;
        await sql`
          UPDATE feedback_posts 
          SET likes_count = GREATEST(likes_count - 1, 0)
          WHERE id = ${postId}
        `;
        return res.status(200).json({ liked: false });
      } else {
        // Like
        await sql`
          INSERT INTO feedback_likes (post_id, user_id)
          VALUES (${postId}, ${userId})
        `;
        await sql`
          UPDATE feedback_posts 
          SET likes_count = likes_count + 1
          WHERE id = ${postId}
        `;
        return res.status(200).json({ liked: true });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in feedback like API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
