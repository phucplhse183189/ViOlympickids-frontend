import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

async function readJson(req: VercelRequest): Promise<any> {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve());
    req.on("error", reject);
  });
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  try {
    const { question } = await readJson(req);
    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Missing question" });
      return;
    }

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Bạn là robot dạy toán lớp 2. Hãy trả lời ngắn gọn, vui vẻ, dễ hiểu, không dùng từ khó.

Nếu câu hỏi KHÔNG liên quan đến toán lớp 2 hoặc không phù hợp với học sinh, hãy nhẹ nhàng hướng lại về toán lớp 2. Ngoài ra, con có thể hỏi về cách chơi game và cách sử dụng web học toán; khi đó hãy hướng dẫn ngắn gọn, từng bước dễ hiểu.

Câu hỏi: ${question}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 512,
        },
      }),
    });

    const data = (await response.json()) as GeminiResponse;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      res.status(502).json({ error: "Empty response", raw: data });
      return;
    }

    res.status(200).json({ answer: text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unknown error" });
  }
}
