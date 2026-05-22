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
    const { parentId, name, grade, avatarEmoji, avatarBg, plan, gender } =
      req.body as {
        parentId: string;
        name: string;
        grade: string;
        avatarEmoji: string;
        avatarBg?: string;
        plan?: "FREE" | "PRO" | "VIP";
        gender?: "boy" | "girl";
      };

    if (!parentId || !name || !grade || !avatarEmoji) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const [child] = await db
      .insert(schema.children)
      .values({
        parentId,
        name: name.trim(),
        grade,
        avatarEmoji,
        avatarBg: avatarBg ?? "bg-blue-100",
        plan: plan ?? "FREE",
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
