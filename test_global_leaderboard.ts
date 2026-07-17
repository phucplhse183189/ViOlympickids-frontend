import { db } from "./api/_db.js";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(sql`
    WITH best_attempts_per_lesson AS (
      SELECT DISTINCT ON (qa.child_id, qa.lesson_id)
        qa.child_id, qa.score, qa.total_questions, qa.attempt_number, qa.completed_at
      FROM quiz_attempts qa
      ORDER BY qa.child_id, qa.lesson_id, qa.score DESC, qa.attempt_number ASC, qa.completed_at ASC
    ),
    global_aggregation AS (
      SELECT
        bapl.child_id,
        SUM(bapl.score) AS score,
        SUM(bapl.total_questions) AS total_questions,
        SUM(bapl.attempt_number) AS attempt_number,
        MAX(bapl.completed_at) AS completed_at,
        c.name, c.avatar_emoji, c.avatar_bg
      FROM best_attempts_per_lesson bapl
      INNER JOIN children c ON c.id = bapl.child_id
      GROUP BY bapl.child_id, c.name, c.avatar_emoji, c.avatar_bg
    )
    SELECT child_id, score, name, RANK() OVER (ORDER BY score DESC, attempt_number ASC, completed_at ASC)::int AS rank
    FROM global_aggregation
    ORDER BY rank ASC, completed_at ASC;
  `);
  console.table(res.rows);
  process.exit(0);
}
main();
