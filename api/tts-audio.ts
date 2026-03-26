/// <reference types="node" />

type VercelRequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
  send: (body: Buffer | string) => void;
};

function readTargetUrl(req: VercelRequestLike): string {
  const q = req.query?.url;
  if (typeof q === "string") return q;
  if (Array.isArray(q) && q[0]) return q[0];

  if (req.url) {
    try {
      const u = new URL(req.url, "http://localhost");
      return u.searchParams.get("url") || "";
    } catch {
      return "";
    }
  }
  return "";
}

function isAllowedAudioHost(target: URL): boolean {
  const host = target.hostname.toLowerCase();
  return host === "file01.fpt.ai" || host.endsWith(".fpt.ai");
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const targetRaw = readTargetUrl(req);
  if (!targetRaw) {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  let target: URL;
  try {
    target = new URL(targetRaw);
  } catch {
    res.status(400).json({ error: "Invalid url" });
    return;
  }

  if (!isAllowedAudioHost(target)) {
    res.status(403).json({ error: "Host not allowed" });
    return;
  }

  try {
    const upstream = await fetch(target.toString(), { method: "GET" });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Upstream audio fetch failed" });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    const cacheControl = upstream.headers.get("cache-control") || "public, max-age=3600";

    const arrayBuffer = await upstream.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", cacheControl);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(body);
  } catch (error: any) {
    res.status(502).json({ error: error?.message ?? "Audio proxy failed" });
  }
}
