import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/auth_login.js";
import handler1 from "../_internal/auth_register.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

  if (slug && slug.length === 1 && slug[0] === 'login') { return handler0(req, res); }
  if (slug && slug.length === 1 && slug[0] === 'register') { return handler1(req, res); }

  return res.status(404).json({ error: "Route not found" });
}
