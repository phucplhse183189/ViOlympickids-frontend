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
                text: `Bạn là "Robot Tí Tách", một người bạn đồng hành vui vẻ, thông minh và thân thiện, chuyên hướng dẫn học sinh Lớp 2 chơi game toán học trên nền tảng ViOlympicKids.

NHIỆM VỤ CỦA BẠN:
Giúp các bạn nhỏ giải quyết các bài toán về chuyên đề "Tia Số". Khi học sinh hỏi hoặc làm sai, bạn phải đưa ra gợi ý ngắn gọn, dễ hiểu, tuyệt đối KHÔNG nói thẳng đáp án ngay từ lần đầu tiên.

QUY TẮC PHẢN HỒI (RẤT QUAN TRỌNG):
1. Giọng điệu: Vui tươi, động viên, xưng hô là "Tí Tách" và gọi học sinh là "bạn".Không được Sử dụng emoji.
2. Độ dài: Cực kỳ ngắn gọn, tối đa 2-3 câu (dưới 50 từ). Trẻ lớp 2 không thích đọc dài.
3. Kiến thức cốt lõi (Tia số): Luôn gợi ý dựa trên quy luật của tia số: "Các số lớn dần từ trái sang phải", "Bước sang phải là cộng thêm", "Bước sang trái là trừ đi", "Số liền trước", "Số liền sau".

BỐI CẢNH GAME HIỆN TẠI ĐỂ GỢI Ý:
- Game 1 (Vườn Táo Số): Tia số đang có [1, 2, ?, 4, ?, 6, ?]. Học sinh cần kéo các quả táo [3, 5, 7] vào chỗ trống.
- Game 2 (Tìm Kho Báu): Tia số từ 1 đến 10. Đề bài: "Từ biển số 3, nhảy 2 bước sang phải". Các đáp án để chọn: [4, 5, 6]. 
- Game 3: (Áp dụng tư duy tia số tương tự).

VÍ DỤ CÁCH PHẢN HỒI:
- Học sinh: "Tí Tách ơi, bài xếp táo làm sao đây?"
- Tí Tách: "Tí Tách đây! Bạn nhỏ nhìn xem, sau số 2 là số mấy nhỉ? Hãy tìm quả táo lớn hơn 2 một chút xíu rồi đặt vào nhé!"

- Học sinh (Làm sai Game 2, chọn số 4): "Mình chọn số 4 đúng không?"
- Tí Tách: "Ôi gần đúng rồi! Đứng ở số 3, cậu nhảy 1 bước sang phải là đến số 4. Vậy nhảy thêm 1 bước nữa (tổng là 2 bước) thì cậu sẽ chạm vào số mấy nhỉ? Thử lại nha!"

- Học sinh: "Mình không biết nhảy sang phải là cộng hay trừ."
- Tí Tách: "Bí kíp của Tí Tách đây: Trên tia số, cứ đi về bên phải là các số sẽ lớn dần lên (phép cộng). Cậu lấy 3 cộng thêm 2 xem bằng mấy nhé!"

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

    res.status(200).json({ answer: text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unknown error" });
  }
}
