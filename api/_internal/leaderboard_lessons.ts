import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, asc, inArray } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/leaderboard/lessons
 * Trả về danh sách bài học có câu hỏi quiz (dùng cho dropdown chọn bài).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // GROUP BY để loại trùng (trường hợp có nhiều câu hỏi - dù hiện tại ta lấy toàn bộ lessons)
    const rows = await db
      .selectDistinctOn([schema.lessons.id], {
        id: schema.lessons.id,
        title: schema.lessons.title,
        emoji: schema.lessons.emoji,
        topicTitle: schema.topics.title,
        topicNumber: schema.topics.topicNumber,
        lessonNumber: schema.lessons.lessonNumber,
      })
      .from(schema.lessons)
      .innerJoin(
        schema.topics,
        eq(schema.topics.id, schema.lessons.topicId)
      )
      .where(inArray(schema.lessons.lessonNumber, [2, 46]))
      .orderBy(
        schema.lessons.id,
        asc(schema.topics.topicNumber),
        asc(schema.lessons.lessonNumber)
      );

    // Sắp xếp lại theo topicNumber, lessonNumber sau khi DISTINCT ON
    const sorted = rows.sort((a, b) => {
      if (a.topicNumber !== b.topicNumber) return a.topicNumber - b.topicNumber;
      return a.lessonNumber - b.lessonNumber;
    });

    // Bỏ các trường phụ trợ trước khi trả về
    const result = sorted.map(({ topicNumber, lessonNumber, ...rest }) => rest);

    // Thêm mục "TỔNG KẾT TOÀN KHOÁ" lên đầu danh sách
    result.unshift({
      id: "global",
      title: "TỔNG KẾT TOÀN KHOÁ",
      emoji: "🏆",
      topicTitle: "BẢNG VÀNG",
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Leaderboard lessons error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
