import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/transactions_index.js";


export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (!slug || slug.length === 0) { return handler0(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
