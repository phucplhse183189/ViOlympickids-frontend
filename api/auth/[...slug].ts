import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/auth_login.js";
import handler1 from "../_internal/auth_register.js";


export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (slug && slug.length === 1 && slug[0] === 'login') { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'register') { return handler1(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
