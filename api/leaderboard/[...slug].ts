import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/leaderboard_lessons.js";
import handler1 from "../_internal/leaderboard_submit.js";
import handler2 from "../_internal/leaderboard_quiz.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Fix: Vercel API catch-all might not populate req.query.slug reliably outside Next.js
  // So we parse the URL manually like in router.ts
  const urlPath = (req.url || "").split("?")[0];
  const parts = urlPath.split("/").filter(Boolean);
  
  // parts[0] = "api", parts[1] = "leaderboard", parts[2] = slug
  let slugStr = parts[2];
  
  // Fallback to req.query if available (for local dev environments)
  if (!slugStr && req.query.slug) {
    if (typeof req.query.slug === 'string') slugStr = req.query.slug;
    else if (Array.isArray(req.query.slug)) slugStr = req.query.slug[0];
  }

  if (slugStr === 'lessons') { return handler0(req, res); }
  if (slugStr === 'submit') { return handler1(req, res); }
  if (slugStr && slugStr !== 'lessons' && slugStr !== 'submit') { 
    req.query.lessonId = slugStr; 
    return handler2(req, res); 
  }

  return res.status(404).json({ error: "Route not found" });
}
