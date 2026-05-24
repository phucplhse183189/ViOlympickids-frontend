import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/admin_parents.js";
import handler1 from "../_internal/admin_stats.js";
import handler2 from "../_internal/admin_parents_[id]_status.js";
import handler3 from "../_internal/admin_students_[id]_status.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const parts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  const segs = parts.slice(2); // after "api" and "admin"

  // GET /api/admin/parents
  if (segs.length === 1 && segs[0] === "parents") return handler0(req, res);
  // GET /api/admin/stats
  if (segs.length === 1 && segs[0] === "stats") return handler1(req, res);
  // PUT /api/admin/parents/:id/status
  if (segs.length === 3 && segs[0] === "parents" && segs[2] === "status") { req.query.id = segs[1]; return handler2(req, res); }
  // PUT /api/admin/students/:id/status
  if (segs.length === 3 && segs[0] === "students" && segs[2] === "status") { req.query.id = segs[1]; return handler3(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
