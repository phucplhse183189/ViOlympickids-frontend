import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/children_index.js";
import handler1 from "../_internal/children_add.js";
import handler2 from "../_internal/children_[id]_dashboard.js";
import handler3 from "../_internal/children_[id]_activities.js";
import handler4 from "../_internal/children_[id]_plan.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Parse path: /api/children/add → ["api","children","add"]
  const parts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  // Remove "api" and "children" prefix → remaining segments
  const segs = parts.slice(2); // e.g. [] or ["add"] or ["<id>","dashboard"]

  // GET /api/children?parentId=x
  if (segs.length === 0) return handler0(req, res);
  // POST /api/children/add
  if (segs.length === 1 && segs[0] === "add") return handler1(req, res);
  // GET /api/children/:id/dashboard
  if (segs.length === 2 && segs[1] === "dashboard") { req.query.id = segs[0]; return handler2(req, res); }
  // GET /api/children/:id/activities
  if (segs.length === 2 && segs[1] === "activities") { req.query.id = segs[0]; return handler3(req, res); }
  // PUT /api/children/:id/plan
  if (segs.length === 2 && segs[1] === "plan") { req.query.id = segs[0]; return handler4(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
