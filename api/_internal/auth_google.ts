import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq, or } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, schema } from "../_db.js";

const googleClient = new OAuth2Client();

/**
 * POST /api/auth/google
 * Body: { credential: string } — Google JWT ID token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { credential } = req.body as { credential: string };

    if (!credential) {
      return res.status(400).json({ error: "Thiếu credential" });
    }

    // Verify Google JWT token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!googleId || !email) {
      return res.status(400).json({ error: "Không lấy được thông tin từ Google" });
    }

    // Tìm user theo googleId hoặc email
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(
        or(
          eq(schema.users.googleId, googleId),
          eq(schema.users.email, email)
        )
      )
      .limit(1);

    if (existingUser) {
      // Link Google account nếu chưa có googleId
      if (!existingUser.googleId) {
        await db
          .update(schema.users)
          .set({ googleId, email: existingUser.email || email })
          .where(eq(schema.users.id, existingUser.id));
      }

      const { passwordHash: _, ...userInfo } = existingUser;
      return res.status(200).json(userInfo);
    }

    // Tạo user mới (auto-register)
    const displayName = name || email.split("@")[0];
    const parts = displayName.trim().split(/\s+/);
    const avatarInitials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : displayName.slice(0, 2).toUpperCase();

    // Tạo placeholder phone và password cho Google user
    const placeholderPhone = `g_${googleId.slice(0, 15)}`;
    const placeholderHash = await bcrypt.hash(crypto.randomUUID(), 10);

    const [newUser] = await db
      .insert(schema.users)
      .values({
        phone: placeholderPhone,
        passwordHash: placeholderHash,
        name: displayName,
        email,
        googleId,
        avatarInitials,
        avatarId: picture || null,
        role: "parent",
        status: "active",
      })
      .returning();

    const { passwordHash: _, ...userInfo } = newUser;
    return res.status(201).json(userInfo);
  } catch (err: any) {
    console.error("Google auth error:", err);
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(400).json({ error: "Google token hết hạn. Vui lòng thử lại." });
    }
    return res.status(500).json({ error: "Lỗi server" });
  }
}
