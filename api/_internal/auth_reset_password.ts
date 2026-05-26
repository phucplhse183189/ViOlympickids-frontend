import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../_db.js";

/**
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, newPassword } = req.body as {
      token: string;
      newPassword: string;
    };

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Tìm token hợp lệ
    const [resetToken] = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.token, token),
          eq(schema.passwordResetTokens.used, false),
          gt(schema.passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      return res.status(400).json({
        error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
      });
    }

    // Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await db
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, resetToken.userId));

    // Đánh dấu token đã dùng
    await db
      .update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.id, resetToken.id));

    return res.status(200).json({ message: "Mật khẩu đã được đặt lại thành công!" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
