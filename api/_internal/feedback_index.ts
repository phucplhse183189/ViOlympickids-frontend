import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      // Get all feedback posts with author details and replies
      // Note: We use raw sql because the query with nested relations can be complex
      const { rows: posts } = await sql`
        SELECT 
          p.id, 
          p.rating, 
          p.content, 
          p.likes_count as "likesCount",
          p.created_at as "createdAt",
          u.name as "authorName",
          u.avatar_emoji as "authorAvatar",
          (
            SELECT json_agg(json_build_object(
              'id', r.id,
              'content', r.content,
              'createdAt', r.created_at,
              'authorName', ru.name,
              'authorAvatar', ru.avatar_emoji
            ) ORDER BY r.created_at ASC)
            FROM feedback_replies r
            JOIN users ru ON r.user_id = ru.id
            WHERE r.post_id = p.id
          ) as replies
        FROM feedback_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 50
      `;

      // Handle null replies (when there are no replies, json_agg returns null)
      const formattedPosts = posts.map(post => ({
        ...post,
        replies: post.replies || [],
        authorAvatar: post.authorAvatar || "🦊"
      }));

      return res.status(200).json(formattedPosts);
    }

    if (req.method === "POST") {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { rating, content } = req.body;
      if (!rating || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { rows } = await sql`
        INSERT INTO feedback_posts (user_id, rating, content)
        VALUES (${userId}, ${rating}, ${content})
        RETURNING id, rating, content, likes_count as "likesCount", created_at as "createdAt"
      `;

      // Fetch author info to return complete object
      const { rows: userRows } = await sql`
        SELECT name, avatar_emoji FROM users WHERE id = ${userId}
      `;

      const newPost = {
        ...rows[0],
        authorName: userRows[0]?.name || "Parent",
        authorAvatar: userRows[0]?.avatar_emoji || "🦊",
        replies: []
      };

      return res.status(201).json(newPost);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Error in feedback API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
