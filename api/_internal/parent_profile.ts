import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET  /api/parent/profile?id=parentId  → Lấy thông tin phụ huynh
 * PUT  /api/parent/profile              → Cập nhật thông tin phụ huynh
 *   Body: { id, name?, email?, avatarId? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── GET: Lấy profile ────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: "Thiếu id" });
      }

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
      }

      const { passwordHash: _, ...userInfo } = user;
      return res.status(200).json(userInfo);
    } catch (err) {
      console.error("Get profile error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  // ── PUT: Cập nhật profile ───────────────────────────────────────────────────
  if (req.method === "PUT") {
    try {
      const { id, name, email, phone, avatarId } = req.body as {
        id: string;
        name?: string;
        email?: string;
        phone?: string;
        avatarId?: string;
      };

      if (!id) {
        return res.status(400).json({ error: "Thiếu id" });
      }

      // Chỉ cập nhật các trường được gửi lên
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name.trim();
      if (email !== undefined) updates.email = email.trim() || null;
      if (phone !== undefined) {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned === "") {
          updates.phone = null; // cho phép để trống
        } else if (/^(0[3|5|7|8|9])[0-9]{8}$/.test(cleaned)) {
          updates.phone = cleaned;
        } else {
          return res.status(400).json({ error: "Số điện thoại không đúng định dạng VN" });
        }
      }
      if (avatarId !== undefined) updates.avatarId = avatarId;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Không có gì để cập nhật" });
      }

      const [updated] = await db
        .update(schema.users)
        .set(updates)
        .where(eq(schema.users.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
      }

      const { passwordHash: _, ...userInfo } = updated;
      return res.status(200).json(userInfo);
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
