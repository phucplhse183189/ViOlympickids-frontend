import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../_db";

/**
 * POST /api/auth/login
 * Body: { phone: string, password: string }
 * Đăng nhập bằng SĐT + mật khẩu
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phone, password } = req.body as {
      phone: string;
      password: string;
    };

    if (!phone || !password) {
      return res.status(400).json({ error: "Vui lòng nhập số điện thoại và mật khẩu" });
    }

    // Chuẩn hóa SĐT — chỉ giữ chữ số
    const normalizedPhone = phone.replace(/\D/g, "");

    // Tìm user theo SĐT
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, normalizedPhone))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Số điện thoại hoặc mật khẩu không đúng" });
    }

    // So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Số điện thoại hoặc mật khẩu không đúng" });
    }

    // Trả về thông tin user (không trả passwordHash)
    const { passwordHash: _, ...userInfo } = user;

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
