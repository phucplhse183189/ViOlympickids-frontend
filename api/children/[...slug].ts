import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/children_index.js";
import handler1 from "../_internal/children_add.js";
import handler2 from "../_internal/children_[id]_dashboard.js";
import handler3 from "../_internal/children_[id]_activities.js";
import handler4 from "../_internal/children_[id]_plan.js";


export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (!slug || slug.length === 0) { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'add') { return handler1(req, res); }
  if (slug.length === 2 && slug[1] === 'dashboard') { req.query.id = slug[0]; return handler2(req, res); }
  if (slug.length === 2 && slug[1] === 'activities') { req.query.id = slug[0]; return handler3(req, res); }
  if (slug.length === 2 && slug[1] === 'plan') { req.query.id = slug[0]; return handler4(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
