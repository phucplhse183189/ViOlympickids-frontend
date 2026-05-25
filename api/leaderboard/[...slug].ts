import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/leaderboard_lessons.js";
import handler1 from "../_internal/leaderboard_submit.js";
import handler2 from "../_internal/leaderboard_quiz.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (slug && slug.length === 1 && slug[0] === 'lessons') { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'submit') { return handler1(req, res); }
  if (slug && slug.length === 1 && slug[0] !== 'lessons' && slug[0] !== 'submit') { req.query.lessonId = slug[0]; return handler2(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
