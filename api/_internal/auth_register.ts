import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../_db.js";

/**
 * POST /api/auth/register
 * Body: { phone: string, password: string, name: string }
 * Đăng ký tài khoản phụ huynh mới
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phone, password, name, email } = req.body as {
      phone: string;
      password: string;
      name: string;
      email?: string;
    };

    if (!phone || !password || !name) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    // Chuẩn hóa SĐT
    const normalizedPhone = phone.replace(/\D/g, "");

    // Kiểm tra SĐT đã tồn tại chưa
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, normalizedPhone))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Số điện thoại đã được đăng ký" });
    }

    // Hash mật khẩu
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo initials từ tên (VD: "Nguyễn Văn A" → "NA")
    const parts = name.trim().split(/\s+/);
    const avatarInitials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

    // Insert user mới
    const [newUser] = await db
      .insert(schema.users)
      .values({
        phone: normalizedPhone,
        passwordHash,
        name: name.trim(),
        email: email?.trim() || null,
        avatarInitials,
        role: "parent",
        status: "active",
      })
      .returning();

    // Trả về thông tin (không trả passwordHash)
    const { passwordHash: _, ...userInfo } = newUser;

    return res.status(201).json(userInfo);
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
