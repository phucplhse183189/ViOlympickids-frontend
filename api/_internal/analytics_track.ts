import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, schema } from "../_db.js";

/**
 * POST /api/analytics/track
 * Ghi lại một lượt xem trang (page view) cho Web Analytics tự build.
 * Body: { path, referrer?, device?, visitorId, sessionId }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const path = String(body.path || "").slice(0, 300);
    const visitorId = String(body.visitorId || "").slice(0, 64);
    const sessionId = String(body.sessionId || "").slice(0, 64);

    if (!path || !visitorId || !sessionId) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
    }

    const device = ["mobile", "tablet", "desktop"].includes(body.device)
      ? body.device
      : "desktop";
    const referrer = body.referrer
      ? String(body.referrer).slice(0, 300)
      : null;

    await db.insert(schema.pageViews).values({
      path,
      referrer,
      device,
      visitorId,
      sessionId,
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
