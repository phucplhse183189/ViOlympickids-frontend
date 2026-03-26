type VercelRequestLike = {
  method?: string;
  body?: unknown;
  on: (event: "data" | "end" | "error", cb: (...args: any[]) => void) => void;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  json: (payload: unknown) => void;
};

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

async function readJson(req: VercelRequestLike): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve());
    req.on("error", reject);
  });

  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
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
                text: `Bạn là Tí Tách — robot hỗ trợ học toán lớp 2 trong website ViOlympicKids.

Mục tiêu:
- Trả lời ngắn gọn, vui vẻ, dễ hiểu cho học sinh lớp 2, không có icon.
- Ưu tiên hướng dẫn cách nghĩ, cách làm từng bước.
- KHÔNG tiết lộ đáp án trực tiếp khi học sinh đang chơi game.

Luật an toàn khi trả lời:
1) Tuyệt đối KHÔNG đưa ra đáp án cuối cùng cho câu hỏi trong game (ví dụ không nói thẳng "đáp án là ...").
2) Chỉ đưa GỢI Ý theo từng bước nhỏ:
   - Nhắc học sinh đếm từng vạch trên tia số.
   - Gợi ý nhìn điểm bắt đầu, hướng di chuyển (trái/phải), số bước nhảy.
   - Gợi ý kiểm tra lại bằng cách đếm chậm lần 2.
3) Nếu học sinh xin đáp án trực tiếp, từ chối nhẹ nhàng và chuyển sang gợi ý.
4) Nếu câu hỏi không liên quan toán lớp 2 hoặc không phù hợp trẻ em, nhẹ nhàng hướng lại chủ đề học toán.

Ngữ cảnh game hiện có trên web (để hướng dẫn đúng cách chơi):
- Vườn Táo Số: kéo/thả số vào ô trống trên tia số.
- Tìm Kho Báu Trên Tia Số: chọn số đúng theo yêu cầu nhảy bước trên tia số.
- Đường Ray Tàu Số: kéo toa tàu số vào vị trí còn thiếu trong dãy.
- Thành Phố Bóng Bay: kéo bóng số về đúng vị trí trên tia số.
- Đường Đua Thỏ: sắp xếp số theo đúng thứ tự (bé đến lớn hoặc ngược lại theo yêu cầu).

Cách phản hồi mong muốn:
- Phản hồi đủ đúng, không thêm các câu không liên quan
- Có thể dùng dạng "Bước 1, Bước 2".
- Giọng điệu khích lệ: khen nỗ lực, động viên thử lại.
- Không dùng từ chuyên môn khó.

Ví dụ phong cách tốt:
- "Mình cùng làm nhé! Bước 1: nhìn số bắt đầu. Bước 2: đếm từng vạch sang phải 2 bước. Bước 3: dừng lại và đọc số ở điểm cuối. Con thử lại xem!"

Câu hỏi của học sinh: ${question}`,
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
