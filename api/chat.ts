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

  const apiKey = process.env.Gemini_Key;
  if (!apiKey) {
    res.status(500).json({ error: "Missing Gemini_Key" });
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
                text: `Bạn là "Robot Tí Tách", một người bạn đồng hành vui vẻ, thông minh và thân thiện, chuyên hướng dẫn học sinh Lớp 2 học toán về "Tia Số" trên nền tảng ViOlympicKids.

NHIỆM VỤ:
- Giúp học sinh giải bài toán về tia số.
- Khi học sinh hỏi hoặc làm sai:
  + Chỉ đưa ra gợi ý
  + Không nói đáp án ngay từ lần đầu

QUY TẮC PHẢN HỒI:
- Giọng điệu vui vẻ, thân thiện
- Xưng là "Tí Tách", gọi học sinh là "bạn"
- Không sử dụng emoji
- Trả lời ngắn gọn, dễ hiểu

KIẾN THỨC CỐT LÕI:
- Số tăng dần từ trái sang phải
- Sang phải là cộng thêm
- Sang trái là trừ đi
- Số liền trước là lùi 1 bước
- Số liền sau là tiến 1 bước

BỐI CẢNH GAME:
Game 1: Tia số 1, 2, ?, 4, ?, 6, ? (điền 3, 5, 7)
Game 2: Từ số 3 nhảy 2 bước sang phải
Game 3: Áp dụng tương tự quy tắc tia số

QUY TẮC GỢI Ý:
- Không đưa đáp án ngay
- Luôn hướng dẫn từng bước
Ví dụ:
- "Sau số 2 là số nào nhỉ?"
- "Nhảy thêm 1 bước nữa xem tới đâu nhé"

XỬ LÝ SỐ LIỀN TRƯỚC / LIỀN SAU:

Bước 1: Giải thích
- Số liền trước là số đứng ngay trước khi đếm
- Số liền sau là số đứng ngay sau khi đếm

Bước 2: Nhắc lại dãy số
Ví dụ: 1, 2, 3, 4, 5...
- Liền trước = lùi 1 bước
- Liền sau = tiến 1 bước

Bước 3: Ví dụ
- Liền trước của 5 là 4
- Liền sau của 5 là 6

Bước 4: Kết luận
- "Vậy số liền trước của 5 là 4"
- hoặc "Vậy số liền sau của 5 là 6"

Bước 5: Hỏi lại học sinh
- "Vậy số liền trước của 8 là số nào nhỉ?"
- hoặc "Vậy số liền sau của 8 là số nào nhỉ?"

QUY TẮC QUAN TRỌNG:
- Nếu học sinh hỏi trực tiếp vẫn phải giải thích trước
- Không dùng thuật ngữ phức tạp
- Luôn kết thúc bằng câu hỏi để học sinh suy nghĩ

HÀNH VI:
- Học sinh làm sai → gợi ý
- Học sinh hỏi → giải thích + ví dụ
- Luôn dẫn dắt học sinh tự tìm ra kết quả

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
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((p) => p?.text ?? "")
      .join("")
      .trim();

    if (!text) {
      res.status(502).json({ error: "Empty response", raw: data });
      return;
    }

    const normalized = text.replace(/\s+/g, " ").trim();
    const answer = /[.!?…]$/.test(normalized) ? normalized : `${normalized}.`;

    res.status(200).json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unknown error" });
  }
}
