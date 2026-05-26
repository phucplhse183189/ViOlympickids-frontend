import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, schema } from "../_db.js";
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * POST /api/auth/forgot-password
 * Body: { phoneOrEmail: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phoneOrEmail } = req.body as { phoneOrEmail: string };

    if (!phoneOrEmail?.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập số điện thoại hoặc email" });
    }

    const input = phoneOrEmail.trim();
    const isEmail = input.includes("@");

    // Tìm user theo SĐT hoặc email
    const [user] = await db
      .select()
      .from(schema.users)
      .where(
        isEmail
          ? eq(schema.users.email, input)
          : eq(schema.users.phone, input.replace(/\D/g, ""))
      )
      .limit(1);

    if (!user) {
      // Vẫn trả success để tránh leak thông tin user tồn tại
      return res.status(200).json({
        message: "Nếu tài khoản tồn tại, chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu.",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        error: "Tài khoản này chưa có email. Vui lòng liên hệ hỗ trợ.",
      });
    }

    // Tạo reset token
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomBytes(8).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await db.insert(schema.passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Gửi email qua Resend
    const appUrl = process.env.VITE_APP_URL || "https://violympickids.vercel.app";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await getResend().emails.send({
      from: "ViOlympicKids <onboarding@resend.dev>",
      to: user.email,
      subject: "Đặt lại mật khẩu - ViOlympicKids",
      html: `
        <div style="font-family: 'Be Vietnam Pro', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0;">ViOlympicKids</h1>
            <p style="color: #9ca3af; font-size: 14px;">Đặt lại mật khẩu</p>
          </div>
          <div style="background: #fff7ed; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #374151; margin: 0 0 16px;">Xin chào <strong>${user.name}</strong>,</p>
            <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              Nhấn nút bên dưới để tạo mật khẩu mới:
            </p>
            <div style="text-align: center;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ec4899); color: white; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 700; font-size: 15px;">
                🔑 Đặt lại mật khẩu
              </a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
            Link này sẽ hết hạn sau 15 phút.<br/>
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Nếu tài khoản tồn tại, chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Lỗi server. Vui lòng thử lại sau." });
  }
}
