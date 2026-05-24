import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/parent_profile.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const parts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  const segs = parts.slice(2); // after "api" and "parent"

  // GET/PUT /api/parent/profile
  if (segs.length === 1 && segs[0] === "profile") return handler0(req, res);

  return res.status(404).json({ error: "Route not found" });
}
