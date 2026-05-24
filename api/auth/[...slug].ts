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

  // Parse action from URL path directly (more reliable than req.query.slug)
  const url = req.url || "";
  const parts = url.split("?")[0].split("/").filter(Boolean);
  // URL: /api/auth/register → parts = ["api", "auth", "register"]
  const action = parts[parts.length - 1]; // "register" or "login"

  if (action === "login") return handler0(req, res);
  if (action === "register") return handler1(req, res);

  return res.status(404).json({ error: "Route not found", debug: { url, parts, action } });
}
