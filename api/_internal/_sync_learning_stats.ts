import { eq, sql } from "drizzle-orm";
import { db, schema } from "../_db.js";

/** Rebuild denormalized metrics from source-of-truth learning tables. */
export async function syncChildLearningStats(childId: string) {
  const result = await db.execute(sql`
    WITH ranked_attempts AS (
      SELECT qa.score, qa.total_questions, qa.completed_at,
        ROW_NUMBER() OVER (
          PARTITION BY qa.lesson_id
          ORDER BY (qa.score::numeric / NULLIF(qa.total_questions, 0)) DESC, qa.completed_at DESC
        ) AS rank
      FROM quiz_attempts qa WHERE qa.child_id = ${childId}
    ),
    attempt_summary AS (
      SELECT COALESCE(ROUND(AVG(score::numeric * 100 / NULLIF(total_questions, 0))), 0)::int AS avg_score,
        MAX(completed_at) AS last_attempt
      FROM ranked_attempts WHERE rank = 1
    ),
    completion_summary AS (
      SELECT COUNT(DISTINCT lesson_id)::int AS total_lessons, MAX(completed_at) AS last_completion
      FROM completed_lessons WHERE child_id = ${childId}
    )
    SELECT a.avg_score, c.total_lessons,
      GREATEST(a.last_attempt, c.last_completion) AS last_active
    FROM attempt_summary a CROSS JOIN completion_summary c
  `);

  const row = result.rows[0] as { avg_score?: number; total_lessons?: number; last_active?: string | Date | null } | undefined;
  const avgScore = Number(row?.avg_score ?? 0);
  const totalLessons = Number(row?.total_lessons ?? 0);
  const lastActive = row?.last_active ? new Date(row.last_active) : null;

  await db.update(schema.children).set({ avgScore, totalLessons, lastActive }).where(eq(schema.children.id, childId));
  const [dashboard] = await db.select({ id: schema.dashboardStats.id }).from(schema.dashboardStats).where(eq(schema.dashboardStats.childId, childId));
  if (dashboard) {
    await db.update(schema.dashboardStats).set({ overallScore: avgScore, completedLessons: totalLessons }).where(eq(schema.dashboardStats.id, dashboard.id));
  } else {
    await db.insert(schema.dashboardStats).values({ childId, overallScore: avgScore, completedLessons: totalLessons, weeklyMinutes: totalLessons * 15, streakDays: totalLessons > 0 ? 1 : 0 });
  }
  return { avgScore, totalLessons, lastActive };
}
