import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";

/**
 * GET /api/admin/init-db
 * Khởi tạo bảng quiz_attempts nếu chưa có.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id uuid NOT NULL REFERENCES children(id),
        lesson_id uuid NOT NULL REFERENCES lessons(id),
        score integer NOT NULL,
        total_questions integer NOT NULL,
        attempt_number integer NOT NULL,
        completed_at timestamp NOT NULL DEFAULT now()
      );
    `);
    return res.status(200).json({ success: true, message: "Đã tạo bảng quiz_attempts thành công!" });
  } catch (err: any) {
    console.error("Init DB error:", err);
    return res.status(500).json({ error: err.message || "Lỗi tạo bảng" });
  }
}
