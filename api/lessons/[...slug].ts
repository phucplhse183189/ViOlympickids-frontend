import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/lessons_topics.js";
import handler1 from "../_internal/lessons_completed.js";
import handler2 from "../_internal/lessons_[id]_quiz.js";
import handler3 from "../_internal/lessons_[id]_complete.js";


export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (slug && slug.length === 1 && slug[0] === 'topics') { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'completed') { return handler1(req, res); }
  if (slug.length === 2 && slug[1] === 'quiz') { req.query.id = slug[0]; return handler2(req, res); }
  if (slug.length === 2 && slug[1] === 'complete') { req.query.id = slug[0]; return handler3(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
