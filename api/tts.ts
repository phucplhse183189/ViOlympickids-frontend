/// <reference types="node" />

type VercelRequestLike = {
  method?: string;
  body?: unknown;
  on: (event: "data" | "end" | "error", cb: (...args: any[]) => void) => void;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  json: (payload: unknown) => void;
};

type FptTtsResponse = {
  async?: string;
  url?: string;
  error?: number;
  message?: string;
};

async function readJson(req: VercelRequestLike): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve());
    req.on("error", reject);
  });

  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.fpt_api;
  if (!apiKey) {
    res.status(500).json({ error: "Missing fpt_api" });
    return;
  }

  try {
    const body = await readJson(req);
    const text = body.text;
    const voice = typeof body.voice === "string" ? body.voice : "banmai";
    const speed = typeof body.speed === "string" ? body.speed : "";
    const format = typeof body.format === "string" ? body.format : "mp3";

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing text" });
      return;
    }

    const fptResponse = await fetch("https://api.fpt.ai/hmi/tts/v5", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        voice: String(voice),
        speed: String(speed),
        format: String(format),
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: text,
    });

    const data = (await fptResponse.json()) as FptTtsResponse;

    if (!fptResponse.ok) {
      res.status(502).json({ error: "FPT TTS request failed", raw: data });
      return;
    }

    const audioUrl = data?.async || data?.url;
    if (!audioUrl) {
      res.status(502).json({ error: "FPT TTS returned no audio url", raw: data });
      return;
    }

    res.status(200).json({ audioUrl, raw: data });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unknown error" });
  }
}
