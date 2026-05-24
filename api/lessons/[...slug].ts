import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/lessons_topics.js";
import handler1 from "../_internal/lessons_completed.js";
import handler2 from "../_internal/lessons_[id]_quiz.js";
import handler3 from "../_internal/lessons_[id]_complete.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const parts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  const segs = parts.slice(2); // after "api" and "lessons"

  // GET /api/lessons/topics
  if (segs.length === 1 && segs[0] === "topics") return handler0(req, res);
  // GET /api/lessons/completed?childId=x
  if (segs.length === 1 && segs[0] === "completed") return handler1(req, res);
  // GET /api/lessons/:id/quiz
  if (segs.length === 2 && segs[1] === "quiz") { req.query.id = segs[0]; return handler2(req, res); }
  // POST /api/lessons/:id/complete
  if (segs.length === 2 && segs[1] === "complete") { req.query.id = segs[0]; return handler3(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
