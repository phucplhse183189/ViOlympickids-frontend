import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";

/**
 * GET /api/admin/init-db
 * Khởi tạo bảng quiz_attempts nếu chưa có.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
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

    // Khởi tạo bảng payment_orders của PayOS nếu chưa có
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_code bigint UNIQUE NOT NULL,
        parent_id uuid NOT NULL REFERENCES users(id),
        child_id uuid NOT NULL REFERENCES children(id),
        plan varchar(20) NOT NULL,
        cycle varchar(20) NOT NULL,
        amount integer NOT NULL,
        status varchar(20) DEFAULT 'PENDING' NOT NULL,
        payos_transaction_id varchar(100),
        created_at timestamp NOT NULL DEFAULT now(),
        paid_at timestamp
      );
    `);

    // Đảm bảo kiểu dữ liệu cột order_code là bigint để không bị tràn số (integer out of range)
    await db.execute(sql`
      ALTER TABLE payment_orders ALTER COLUMN order_code TYPE bigint;
    `);

    // Khởi tạo bảng page_views cho Web Analytics tự build
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        path varchar(300) NOT NULL,
        referrer varchar(300),
        device varchar(20) DEFAULT 'desktop' NOT NULL,
        visitor_id varchar(64) NOT NULL,
        session_id varchar(64) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);

    // Index giúp truy vấn thống kê theo thời gian nhanh hơn
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
    `);

    return res.status(200).json({ success: true, message: "Đã khởi tạo database, page_views và cập nhật bigint cho order_code thành công!" });
  } catch (err: any) {
    console.error("Init DB error:", err);
    return res.status(500).json({ error: err.message || "Lỗi tạo bảng" });
  }
}
