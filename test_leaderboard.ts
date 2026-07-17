import { db } from "./api/_db.js";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(sql`
    WITH best_attempts AS (
      SELECT DISTINCT ON (qa.child_id)
        qa.child_id, qa.score, qa.total_questions, qa.attempt_number, qa.completed_at, c.name
      FROM quiz_attempts qa
      INNER JOIN children c ON c.id = qa.child_id
      WHERE qa.lesson_id = '5d8ff6d1-8106-42e7-ac0f-bb9635c8af9b'
      ORDER BY qa.child_id, qa.score DESC, qa.attempt_number ASC, qa.completed_at ASC
    )
    SELECT child_id, score, name,
           RANK() OVER (ORDER BY score DESC, attempt_number ASC, completed_at ASC)::int AS rank
    FROM best_attempts
    ORDER BY rank ASC, completed_at ASC;
  `);
  console.table(res.rows);
  process.exit(0);
}
main();
