import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "@vercel/postgres";

// Map avatar_id to emoji
const AVATAR_MAP: Record<string, string> = {
  fox: "🦊", panda: "🐼", frog: "🐸", tiger: "🐯",
  lion: "🦁", penguin: "🐧", octopus: "🐙", unicorn: "🦄",
  dragon: "🐲", rabbit: "🐰", butterfly: "🦋", dolphin: "🐬",
};

function getEmoji(avatarId: string | null, initials: string | null): string {
  if (avatarId && AVATAR_MAP[avatarId]) return AVATAR_MAP[avatarId];
  return initials || "👤";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const { rows: posts } = await sql`
        SELECT 
          p.id, 
          p.rating, 
          p.category,
          p.content, 
          p.likes_count as "likesCount",
          p.created_at as "createdAt",
          u.name as "authorName",
          u.avatar_id as "authorAvatarId",
          u.avatar_initials as "authorInitials",
          (
            SELECT json_agg(json_build_object(
              'id', r.id,
              'content', r.content,
              'createdAt', r.created_at,
              'authorName', ru.name,
              'authorAvatarId', ru.avatar_id,
              'authorInitials', ru.avatar_initials
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

      const formattedPosts = posts.map(post => ({
        ...post,
        authorAvatar: getEmoji(post.authorAvatarId, post.authorInitials),
        replies: (post.replies || []).map((r: any) => ({
          ...r,
          authorAvatar: getEmoji(r.authorAvatarId, r.authorInitials),
        })),
      }));

      return res.status(200).json(formattedPosts);
    }

    if (req.method === "POST") {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { rating, content, category = "general" } = req.body;
      const categories = ["interface", "feature", "content", "performance", "support", "general"];
      if (!rating || !content || !categories.includes(category)) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { rows: duplicates } = await sql`
        SELECT id FROM feedback_posts
        WHERE user_id = ${userId} AND category = ${category}
          AND lower(trim(content)) = lower(trim(${content}))
          AND created_at >= NOW() - INTERVAL '10 minutes'
        LIMIT 1
      `;
      if (duplicates.length) return res.status(409).json({ error: "Feedback này vừa được gửi. Vui lòng không gửi lại nội dung trùng." });

      const { rows } = await sql`
        INSERT INTO feedback_posts (user_id, rating, category, content)
        VALUES (${userId}, ${rating}, ${category}, ${content})
        RETURNING id, rating, category, content, likes_count as "likesCount", created_at as "createdAt"
      `;

      const { rows: userRows } = await sql`
        SELECT name, avatar_id, avatar_initials FROM users WHERE id = ${userId}
      `;

      const newPost = {
        ...rows[0],
        authorName: userRows[0]?.name || "Parent",
        authorAvatar: getEmoji(userRows[0]?.avatar_id, userRows[0]?.avatar_initials),
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
