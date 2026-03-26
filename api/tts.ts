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

type VieNeuTtsResponse = {
  audioUrl?: string;
  url?: string;
  audio_url?: string;
  // some services return nested shape
  data?: {
    audioUrl?: string;
    url?: string;
    audio_url?: string;
  };
};

async function waitForAudioReady(audioUrl: string, timeoutMs = 12000): Promise<boolean> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const headRes = await fetch(audioUrl, { method: "HEAD" });
      if (headRes.ok) return true;

      const getRes = await fetch(audioUrl, {
        method: "GET",
        headers: { Range: "bytes=0-1" },
      });
      if (getRes.ok || getRes.status === 206) return true;
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  return false;
}

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

function pickAudioUrl(raw: unknown): string {
  const r = raw as VieNeuTtsResponse | undefined;
  return (
    r?.audioUrl ||
    r?.url ||
    r?.audio_url ||
    r?.data?.audioUrl ||
    r?.data?.url ||
    r?.data?.audio_url ||
    ""
  );
}

function toProxyAudioUrl(audioUrl: string): string {
  try {
    const url = new URL(audioUrl);
    if (url.origin === "https://violympickids.vercel.app") return audioUrl;
    return `/api/tts-audio?url=${encodeURIComponent(audioUrl)}`;
  } catch {
    return audioUrl;
  }
}

async function requestVieNeuTts(input: {
  text: string;
  voice: string;
  speed: string;
  format: string;
}): Promise<{ ok: boolean; audioUrl?: string; raw?: unknown; error?: string }> {
  const serviceUrl = process.env.VIENEU_TTS_URL;
  if (!serviceUrl) {
    return { ok: false, error: "Missing VIENEU_TTS_URL" };
  }

  try {
    const token = process.env.VIENEU_TTS_TOKEN;
    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text: input.text,
        voice: input.voice,
        speed: input.speed,
        format: input.format,
      }),
    });

    const raw = (await response.json().catch(() => ({}))) as unknown;
    if (!response.ok) {
      return { ok: false, raw, error: "VieNeu TTS request failed" };
    }

    const audioUrl = pickAudioUrl(raw);
    if (!audioUrl) {
      return { ok: false, raw, error: "VieNeu TTS returned no audio url" };
    }

    const ready = await waitForAudioReady(audioUrl, 12000);
    if (!ready) {
      return { ok: false, raw, error: "VieNeu audio not ready in time" };
    }

    return { ok: true, audioUrl, raw };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? "VieNeu unknown error" };
  }
}

async function requestFptTts(input: {
  text: string;
  voice: string;
  speed: string;
  format: string;
}): Promise<{ ok: boolean; audioUrl?: string; raw?: unknown; error?: string }> {
  const apiKey = process.env.fpt_api;
  if (!apiKey) {
    return { ok: false, error: "Missing fpt_api" };
  }

  try {
    const fptResponse = await fetch("https://api.fpt.ai/hmi/tts/v5", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        voice: String(input.voice),
        speed: String(input.speed),
        format: String(input.format),
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: input.text,
    });

    const data = (await fptResponse.json()) as FptTtsResponse;

    if (!fptResponse.ok) {
      return { ok: false, raw: data, error: "FPT TTS request failed" };
    }

    const audioUrl = data?.async || data?.url;
    if (!audioUrl) {
      return { ok: false, raw: data, error: "FPT TTS returned no audio url" };
    }

    const ready = await waitForAudioReady(audioUrl, 12000);
    if (!ready) {
      return { ok: false, raw: data, error: "FPT audio not ready in time" };
    }

    return { ok: true, audioUrl, raw: data };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? "FPT unknown error" };
  }
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
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

    const preferredProvider = (process.env.TTS_PROVIDER || "vieneu").toLowerCase();

    if (preferredProvider === "fpt") {
      const fpt = await requestFptTts({ text, voice, speed, format });
      if (fpt.ok) {
        res.status(200).json({ audioUrl: toProxyAudioUrl(fpt.audioUrl || ""), provider: "fpt", raw: fpt.raw });
        return;
      }

      const vieneu = await requestVieNeuTts({ text, voice, speed, format });
      if (vieneu.ok) {
        res.status(200).json({ audioUrl: toProxyAudioUrl(vieneu.audioUrl || ""), provider: "vieneu", raw: vieneu.raw });
        return;
      }

      res.status(502).json({
        error: "Both FPT and VieNeu TTS failed",
        fptError: fpt.error,
        vieneuError: vieneu.error,
      });
      return;
    }

    // Default: VieNeu primary, FPT fallback
    const vieneu = await requestVieNeuTts({ text, voice, speed, format });
    if (vieneu.ok) {
      res.status(200).json({ audioUrl: toProxyAudioUrl(vieneu.audioUrl || ""), provider: "vieneu", raw: vieneu.raw });
      return;
    }

    const fpt = await requestFptTts({ text, voice, speed, format });
    if (fpt.ok) {
      res.status(200).json({ audioUrl: toProxyAudioUrl(fpt.audioUrl || ""), provider: "fpt", raw: fpt.raw });
      return;
    }

    res.status(502).json({
      error: "Both VieNeu and FPT TTS failed",
      vieneuError: vieneu.error,
      fptError: fpt.error,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unknown error" });
  }
}
