import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler0 from "../_internal/transactions_index.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const parts = (req.url || "").split("?")[0].split("/").filter(Boolean);
  const segs = parts.slice(2); // after "api" and "transactions"

  // GET/POST /api/transactions (no sub-path)
  if (segs.length === 0) return handler0(req, res);

  return res.status(404).json({ error: "Route not found" });
}
