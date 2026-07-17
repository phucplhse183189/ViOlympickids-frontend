import { db } from "./api/_db.js";
import { sql } from "drizzle-orm";
import { invalidateCache } from "./api/_internal/_leaderboard_cache.js";

async function main() {
  const childId = '59277892-2c88-4ff6-9729-a0c942e19365';
  
  // Insert missing completed_lessons
  await db.execute(sql`
    INSERT INTO completed_lessons (id, child_id, lesson_id, completed_at)
    SELECT gen_random_uuid(), qa.child_id, qa.lesson_id, NOW()
    FROM quiz_attempts qa
    WHERE qa.child_id = ${childId}
    ON CONFLICT DO NOTHING
  `);

  // Insert or update dashboard_stats
  await db.execute(sql`
    INSERT INTO dashboard_stats (id, child_id, overall_score, completed_lessons, weekly_minutes, streak_days)
    SELECT gen_random_uuid(), qa.child_id, qa.score, 1, 15, 1
    FROM quiz_attempts qa
    WHERE qa.child_id = ${childId}
    LIMIT 1
  `);
  
  invalidateCache('leaderboard:global');

  console.log('Fixed stats for child:', childId);
  process.exit(0);
}
main().catch(console.error);
