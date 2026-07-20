import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, schema } from "../_db.js";

/**
 * POST /api/children/add
 * Body: { parentId, name, grade, avatarEmoji, avatarBg?, plan?, gender? }
 * Thêm hồ sơ bé mới
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { parentId, name, grade, avatarEmoji, avatarBg, gender } =
      req.body as {
        parentId: string;
        name: string;
        grade: string;
        avatarEmoji: string;
        avatarBg?: string;
        gender?: "boy" | "girl";
      };

    if (!parentId || !name || !grade || !avatarEmoji) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const requestUserId = req.headers["x-user-id"] as string | undefined;
    if (!requestUserId) {
      return res.status(401).json({ error: "Vui lòng đăng nhập" });
    }
    if (requestUserId !== parentId) {
      return res.status(403).json({ error: "Không có quyền tạo hồ sơ cho tài khoản này" });
    }

    const [child] = await db
      .insert(schema.children)
      .values({
        parentId,
        name: name.trim(),
        grade,
        avatarEmoji,
        avatarBg: avatarBg ?? "bg-blue-100",
        // Every newly-created student receives the same server-controlled
        // three-day Pro trial. Client payloads cannot override this benefit.
        plan: "PRO",
        planDaysLeft: 3,
        gender,
        status: "active",
      })
      .returning();

    return res.status(201).json(child);
  } catch (err) {
    console.error("Add child error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
