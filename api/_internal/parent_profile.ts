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

      const requestUserId = req.headers["x-user-id"] as string | undefined;
      if (!requestUserId) return res.status(401).json({ error: "Vui lòng đăng nhập" });
      if (requestUserId !== id) return res.status(403).json({ error: "Không có quyền truy cập hồ sơ này" });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
      }

      const { passwordHash: passwordHashToOmit, ...userInfo } = user;
      void passwordHashToOmit;
      res.setHeader("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
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

      const requestUserId = req.headers["x-user-id"] as string | undefined;
      if (!requestUserId) return res.status(401).json({ error: "Vui lòng đăng nhập" });
      if (requestUserId !== id) return res.status(403).json({ error: "Không có quyền cập nhật hồ sơ này" });

      if (name !== undefined && (name.trim().length < 2 || name.trim().length > 100)) {
        return res.status(400).json({ error: "Họ tên phải có từ 2 đến 100 ký tự" });
      }
      if (email !== undefined && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "Email không đúng định dạng" });
      }
      if (avatarId !== undefined && avatarId && avatarId.length > 3_000_000) {
        return res.status(400).json({ error: "Ảnh đại diện quá lớn" });
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

      const { passwordHash: passwordHashToOmit, ...userInfo } = updated;
      void passwordHashToOmit;
      return res.status(200).json(userInfo);
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
