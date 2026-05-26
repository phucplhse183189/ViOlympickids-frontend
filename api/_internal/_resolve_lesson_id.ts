/**
 * Tiện ích giải quyết lessonId: hỗ trợ cả UUID và tên bài dạng "math2-b1", "math2-b2".
 * Nếu là UUID hợp lệ → trả về nguyên.
 * Nếu là string dạng "math2-bX" → tra cứu lessonNumber = X trong DB.
 */
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Bộ nhớ đệm: slug → UUID (không hết hạn, vì lesson IDs không thay đổi)
const slugCache = new Map<string, string>();

/**
 * Chuyển đổi lessonId (có thể là UUID hoặc slug "math2-bX") thành UUID thực.
 * Trả về UUID hoặc null nếu không tìm thấy.
 */
export async function resolveLessonId(lessonIdOrSlug: string): Promise<string | null> {
  // Nếu đã là UUID → trả về luôn
  if (UUID_REGEX.test(lessonIdOrSlug)) {
    return lessonIdOrSlug;
  }

  // Kiểm tra cache
  const cached = slugCache.get(lessonIdOrSlug);
  if (cached) return cached;

  // Thử parse "math2-bX" → lessonNumber X
  const match = lessonIdOrSlug.match(/^math2-b(\d+)$/i);
  if (match) {
    const lessonNumber = parseInt(match[1], 10);
    const [lesson] = await db
      .select({ id: schema.lessons.id })
      .from(schema.lessons)
      .where(eq(schema.lessons.lessonNumber, lessonNumber))
      .limit(1);

    if (lesson) {
      slugCache.set(lessonIdOrSlug, lesson.id);
      return lesson.id;
    }
  }

  return null;
}
