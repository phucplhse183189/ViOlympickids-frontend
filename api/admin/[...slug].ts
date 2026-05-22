import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/admin_parents.js";
import handler1 from "../_internal/admin_stats.js";
import handler2 from "../_internal/admin_parents_[id]_status.js";
import handler3 from "../_internal/admin_students_[id]_status.js";


export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (slug && slug.length === 1 && slug[0] === 'parents') { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'stats') { return handler1(req, res); }
  if (slug[0] === 'parents' && slug.length === 3 && slug[2] === 'status') { req.query.id = slug[1]; return handler2(req, res); }
  if (slug[0] === 'students' && slug.length === 3 && slug[2] === 'status') { req.query.id = slug[1]; return handler3(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
