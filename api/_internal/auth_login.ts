import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../_db.js";

/**
 * POST /api/auth/login
 * Body: { identifier: string, password: string }
 * Đăng nhập bằng email hoặc SĐT + mật khẩu
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { identifier: rawIdentifier, phone, password } = req.body as {
      identifier?: string;
      phone?: string;
      password: string;
    };
    const identifier = (rawIdentifier || phone || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email hoặc số điện thoại và mật khẩu" });
    }

    const isEmail = identifier.includes("@");
    const normalizedIdentifier = isEmail ? identifier.toLocaleLowerCase() : identifier.replace(/\D/g, "");

    // Tìm user theo email hoặc SĐT. Giữ nhánh phone để tương thích dữ liệu cũ.
    const [user] = await db
      .select()
      .from(schema.users)
      .where(or(
        eq(schema.users.phone, normalizedIdentifier),
        sql`lower(${schema.users.email}) = ${normalizedIdentifier}`,
      ))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Email, số điện thoại hoặc mật khẩu không đúng" });
    }

    // So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email, số điện thoại hoặc mật khẩu không đúng" });
    }

    // Trả về thông tin user (không trả passwordHash)
    const { passwordHash: _, ...userInfo } = user;

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
