/**
 * Chèn quiz Bài 46 vào DB đã có sẵn (không xoá dữ liệu cũ).
 * Chạy: npx dotenv -e .env.local -- npx tsx src/shared/db/seed-b46-quiz.ts
 */
import "dotenv/config";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { eq, and } from "drizzle-orm";
import * as schema from "./schema";

const db = drizzle(sql, { schema });

async function seedB46Quiz() {
  const [lesson] = await db
    .select({ id: schema.lessons.id })
    .from(schema.lessons)
    .where(eq(schema.lessons.lessonNumber, 46))
    .limit(1);

  if (!lesson) {
    console.error("❌ Không tìm thấy bài học số 46.");
    process.exit(1);
  }

  const [existing] = await db
    .select({ id: schema.quizQuestions.id })
    .from(schema.quizQuestions)
    .where(
      and(
        eq(schema.quizQuestions.lessonId, lesson.id),
        eq(schema.quizQuestions.questionNumber, 1)
      )
    )
    .limit(1);

  if (existing) {
    console.log("ℹ️  Quiz Bài 46 đã tồn tại — bỏ qua.");
    await sql.end();
    process.exit(0);
  }

  await db.insert(schema.quizQuestions).values([
    { lessonId: lesson.id, questionNumber: 1, question: "Khối trụ có bao nhiêu mặt đáy hình tròn?", options: ["1 mặt","2 mặt","3 mặt","Không có"], correctIndex: 1, explanation: "Khối trụ có 2 mặt đáy hình tròn ở hai đầu." },
    { lessonId: lesson.id, questionNumber: 2, question: "Khối cầu có bao nhiêu mặt cong?", options: ["1 mặt","2 mặt","3 mặt","4 mặt"], correctIndex: 0, explanation: "Khối cầu chỉ có 1 mặt cong duy nhất, không có cạnh và đỉnh." },
    { lessonId: lesson.id, questionNumber: 3, question: "Đồ vật nào có dạng khối trụ?", options: ["Quả bóng đá","Lon nước ngọt","Xúc xắc","Hộp quà"], correctIndex: 1, explanation: "Lon nước ngọt có 2 đáy tròn và thân cong — đó là khối trụ." },
    { lessonId: lesson.id, questionNumber: 4, question: "Đồ vật nào có dạng khối cầu?", options: ["Cuộn giấy vệ sinh","Cục pin","Quả bóng đá","Cái trống"], correctIndex: 2, explanation: "Quả bóng đá tròn vo, lăn được mọi hướng — đó là khối cầu." },
    { lessonId: lesson.id, questionNumber: 5, question: "Khi mở khối trụ ra, ta được những hình nào?", options: ["2 hình tròn và 1 hình chữ nhật","1 hình tròn và 2 hình vuông","2 bán cầu","1 hình tam giác"], correctIndex: 0, explanation: "Khối trụ khi trải ra gồm 2 hình tròn (2 đáy) và 1 hình chữ nhật (mặt bên)." },
    { lessonId: lesson.id, questionNumber: 6, question: "Khi cắt khối cầu làm đôi, ta được gì?", options: ["2 hình tròn","2 bán cầu","1 hình chữ nhật","2 hình vuông"], correctIndex: 1, explanation: "Khối cầu khi cắt đôi ta được 2 bán cầu, mỗi bán cầu có 1 mặt phẳng và 1 mặt cong." },
    { lessonId: lesson.id, questionNumber: 7, question: "Khối trụ có bao nhiêu mặt bên cong?", options: ["Không có","1 mặt","2 mặt","3 mặt"], correctIndex: 1, explanation: "Khối trụ có 1 mặt bên cong bao quanh thân." },
    { lessonId: lesson.id, questionNumber: 8, question: "Cuộn giấy vệ sinh thuộc loại hình khối nào?", options: ["Khối cầu","Khối trụ","Khối lập phương","Khối hộp chữ nhật"], correctIndex: 1, explanation: "Cuộn giấy có 2 đáy tròn và thân cong — đó là khối trụ." },
  ]);

  console.log("✅ Đã thêm 8 câu quiz cho Bài 46.");
  await sql.end();
}

seedB46Quiz().catch((err) => {
  console.error(err);
  process.exit(1);
});
