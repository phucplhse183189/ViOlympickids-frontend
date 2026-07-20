import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/parents
 * Lấy tất cả phụ huynh (role='parent') kèm danh sách con
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Lấy tất cả parents
    const parents = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, "parent"));

    // Lấy tất cả children
    const allChildren = await db.select().from(schema.children);
    const liveStats = await db.execute(sql`
      WITH ranked_attempts AS (
        SELECT child_id, lesson_id, score, total_questions, completed_at,
          ROW_NUMBER() OVER (
            PARTITION BY child_id, lesson_id
            ORDER BY (score::numeric / NULLIF(total_questions, 0)) DESC, completed_at DESC
          ) AS rank
        FROM quiz_attempts
      ),
      scores AS (
        SELECT child_id,
          COALESCE(ROUND(AVG(score::numeric * 100 / NULLIF(total_questions, 0))), 0)::int AS avg_score,
          MAX(completed_at) AS last_attempt
        FROM ranked_attempts WHERE rank = 1 GROUP BY child_id
      ),
      completions AS (
        SELECT child_id, COUNT(DISTINCT lesson_id)::int AS total_lessons,
          MAX(completed_at) AS last_completion
        FROM completed_lessons GROUP BY child_id
      )
      SELECT c.id AS child_id, COALESCE(s.avg_score, 0)::int AS avg_score,
        COALESCE(cp.total_lessons, 0)::int AS total_lessons,
        GREATEST(s.last_attempt, cp.last_completion) AS last_active
      FROM children c
      LEFT JOIN scores s ON s.child_id = c.id
      LEFT JOIN completions cp ON cp.child_id = c.id
    `);
    const statsByChild = new Map(liveStats.rows.map((row) => [String(row.child_id), row]));

    // Gộp children vào từng parent
    const result = parents.map((p) => {
      const { passwordHash: _, ...parentInfo } = p;
      return {
        ...parentInfo,
        children: allChildren.filter((c) => c.parentId === p.id).map((child) => {
          const live = statsByChild.get(child.id);
          return {
            ...child,
            totalLessons: Number(live?.total_lessons ?? 0),
            avgScore: Number(live?.avg_score ?? 0),
            lastActive: live?.last_active ?? child.lastActive,
          };
        }),
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Admin parents error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
