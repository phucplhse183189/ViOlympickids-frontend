/**
 * ════════════════════════════════════════════════
 *  DIAGNOSTIC: Check leaderboard pipeline end-to-end
 *  Run: npx dotenv -e .env.local -- npx tsx scripts/debug_leaderboard.ts
 * ════════════════════════════════════════════════
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "../src/shared/db/schema.js";

const db = drizzle(sql, { schema });

async function run() {
  console.log("🔍 Leaderboard Diagnostic Tool\n");

  // ── 1. Check lessons table ────────────────────────────────────
  console.log("━━━ 1. LESSONS TABLE ━━━");
  const lessons = await db.select({
    id: schema.lessons.id,
    lessonNumber: schema.lessons.lessonNumber,
    title: schema.lessons.title,
    topicId: schema.lessons.topicId,
  }).from(schema.lessons).limit(10);
  console.log(`  Total returned: ${lessons.length}`);
  lessons.forEach(l => {
    console.log(`  [${l.lessonNumber}] id="${l.id}" | "${l.title}"`);
  });

  // ── 2. Check topics table ────────────────────────────────────
  console.log("\n━━━ 2. TOPICS TABLE ━━━");
  const topics = await db.select({
    id: schema.topics.id,
    topicNumber: schema.topics.topicNumber,
    title: schema.topics.title,
  }).from(schema.topics).limit(5);
  console.log(`  Total returned: ${topics.length}`);
  topics.forEach(t => {
    console.log(`  [${t.topicNumber}] id="${t.id}" | "${t.title}"`);
  });

  // ── 3. Check quiz_questions table ────────────────────────────
  console.log("\n━━━ 3. QUIZ QUESTIONS TABLE ━━━");
  const quizQuestions = await db.select({
    id: schema.quizQuestions.id,
    lessonId: schema.quizQuestions.lessonId,
    questionNumber: schema.quizQuestions.questionNumber,
    question: schema.quizQuestions.question,
  }).from(schema.quizQuestions).limit(5);
  console.log(`  Total returned: ${quizQuestions.length}`);
  quizQuestions.forEach(q => {
    console.log(`  [Q${q.questionNumber}] lessonId="${q.lessonId}" | "${q.question.slice(0, 50)}..."`);
  });

  // ── 4. Check if quiz_questions.lessonId matches any lessons.id ─
  console.log("\n━━━ 4. JOIN CHECK: quiz_questions ↔ lessons ━━━");
  try {
    const rawJoinResult = await sql`
      SELECT COUNT(*) as cnt
      FROM quiz_questions qq
      INNER JOIN lessons l ON l.id = qq.lesson_id
    `;
    console.log(`  Matching rows (JOIN): ${rawJoinResult.rows[0].cnt}`);
  } catch (err: any) {
    console.log(`  ❌ JOIN FAILED: ${err.message}`);
  }

  // ── 5. Check actual column types ─────────────────────────────
  console.log("\n━━━ 5. COLUMN TYPES ━━━");
  try {
    const colInfo = await sql`
      SELECT table_name, column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name IN ('lessons', 'quiz_questions', 'quiz_attempts')
        AND column_name IN ('id', 'lesson_id', 'child_id')
      ORDER BY table_name, column_name
    `;
    colInfo.rows.forEach(r => {
      console.log(`  ${r.table_name}.${r.column_name} → ${r.data_type} (${r.udt_name})`);
    });
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message}`);
  }

  // ── 6. Check quiz_attempts ───────────────────────────────────
  console.log("\n━━━ 6. QUIZ ATTEMPTS TABLE ━━━");
  const attempts = await db.select().from(schema.quizAttempts).limit(5);
  console.log(`  Total returned: ${attempts.length}`);
  attempts.forEach(a => {
    console.log(`  childId="${a.childId}" lessonId="${a.lessonId}" score=${a.score}/${a.totalQuestions} attempt#${a.attemptNumber}`);
  });

  // ── 7. Check children table ──────────────────────────────────
  console.log("\n━━━ 7. CHILDREN TABLE (first 3) ━━━");
  const children = await db.select({
    id: schema.children.id,
    name: schema.children.name,
    avatarEmoji: schema.children.avatarEmoji,
  }).from(schema.children).limit(3);
  children.forEach(c => {
    console.log(`  id="${c.id}" name="${c.name}" emoji="${c.avatarEmoji}"`);
  });

  // ── 8. Simulate the leaderboard_lessons query ────────────────
  console.log("\n━━━ 8. SIMULATE leaderboard_lessons QUERY ━━━");
  try {
    const rawResult = await sql`
      SELECT DISTINCT ON (l.id)
        l.id,
        l.title,
        l.emoji,
        t.title AS topic_title,
        t.topic_number,
        l.lesson_number
      FROM lessons l
      INNER JOIN quiz_questions qq ON qq.lesson_id = l.id
      INNER JOIN topics t ON t.id = l.topic_id
      ORDER BY l.id, t.topic_number, l.lesson_number
    `;
    console.log(`  Results: ${rawResult.rows.length}`);
    rawResult.rows.forEach(r => {
      console.log(`  [B${r.lesson_number}] "${r.title}" emoji=${r.emoji}`);
    });
  } catch (err: any) {
    console.log(`  ❌ QUERY FAILED: ${err.message}`);
  }

  // ── 9. Try a raw quiz fetch like the quiz page does ──────────
  console.log("\n━━━ 9. SIMULATE getQuiz('math2-b2') ━━━");
  try {
    const quizResult = await sql`
      SELECT id, lesson_id, question_number, question
      FROM quiz_questions
      WHERE lesson_id = 'math2-b2'
      ORDER BY question_number
      LIMIT 3
    `;
    console.log(`  Results with lesson_id='math2-b2': ${quizResult.rows.length}`);
    quizResult.rows.forEach(r => {
      console.log(`  [Q${r.question_number}] "${r.question.slice(0, 50)}..."`);
    });
  } catch (err: any) {
    console.log(`  ❌ This FAILED (probably UUID type mismatch): ${err.message}`);
    
    // Try with UUID-based lookup
    console.log("  → Trying UUID-based lookup via lessonNumber...");
    const lesson2 = await sql`
      SELECT id FROM lessons WHERE lesson_number = 2 LIMIT 1
    `;
    if (lesson2.rows.length > 0) {
      const uuid = lesson2.rows[0].id;
      console.log(`  → Lesson #2 UUID = "${uuid}"`);
      const quizResult2 = await sql`
        SELECT id, lesson_id, question_number, question
        FROM quiz_questions
        WHERE lesson_id = ${uuid}::uuid
        ORDER BY question_number
        LIMIT 3
      `;
      console.log(`  → Results with UUID: ${quizResult2.rows.length}`);
    }
  }

  console.log("\n🏁 Done!");
  await sql.end();
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
