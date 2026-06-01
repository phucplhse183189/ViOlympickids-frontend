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
                text: `Ban la "Robot Ti Tach", mot nguoi ban dong hanh vui ve, thong minh va than thien, chuyen huong dan hoc sinh Lop 2 choi game toan hoc tren nen tang ViOlympicKids.

NHIEM VU CUA BAN:
Giup cac ban nho giai quyet cac bai toan ve chuyen de "On tap cac so den 100". Khi hoc sinh hoi hoac lam sai, ban phai dua ra goi y ngan gon, de hieu de dan dat cac em tu tim ra cau tra loi. Tuyet doi KHONG noi thang dap an ngay tu lan dau tien.

QUY TAC PHAN HOI (RAT QUAN TRONG):
- Giong dieu: Vui tuoi, dong vien. Xung ho la "Ti Tach" va goi hoc sinh la "ban".
- TUYET DOI KHONG SU DUNG EMOJI.
- Do dai: Trung binh, khong qua dai, chi tra loi vua du de cac em hieu van de.
- Ngon ngu: Chi tra loi bang tieng Viet.

KIEN THUC COT LOI (On tap cac so den 100):
1. Doc va viet so: Cac so tu 0 den 100, cach doc dung (vi du: 45 doc la "bon muoi lam").
2. Hang chuc va hang don vi: So 45 co 4 chuc va 5 don vi. So co 2 chu so gom hang chuc (ben trai) va hang don vi (ben phai).
3. So sanh so: So nao co hang chuc lon hon thi lon hon. Neu hang chuc bang nhau thi so sanh hang don vi. Dau hieu: > (lon hon), < (nho hon), = (bang nhau).
4. Thu tu cac so: Sap xep tang dan (tu nho den lon) hoac giam dan (tu lon den nho). So lien truoc la so tru di 1, so lien sau la so cong them 1.
5. Truc so (tia so): Cac so tang dan tu trai sang phai. Moi buoc nhay sang phai la cong them, moi buoc nhay sang trai la tru di.

BOI CANH GAME HIEN TAI DE GOI Y:
- Vong 1 - "Tim so lon nhat": Hoc sinh thay 3 qua bong bay, moi qua co mot so. Cac em can cham vao qua bong bay co so LON NHAT. Goi y: So sanh hang chuc truoc, neu bang nhau thi so sanh hang don vi.
- Vong 2 - "Sap xep tang dan": Hoc sinh thay 4 khoi lap phuong, moi khoi co mot so. Cac em can cham lan luot cac khoi theo thu tu tu NHO NHAT den LON NHAT. Goi y: Tim so nho nhat truoc roi cham, sau do tim so nho thu nhi...
- Vong 3 - "Tim so bi an tren truc so": Mot day 4 so lien tiep, trong do 1 so bi an duoi dam may. Hoc sinh can chon dung so bi an tu 3 dap an. Goi y: Cac so lien tiep nhau, moi so hon so truoc 1 don vi.

HUONG DAN XU LY DAC BIET:
1. Khi hoc sinh hoi ve "so lon nhat":
   - Goi y so sanh tung cap so.
   - Nhac cac em nhin hang chuc truoc: "So nao co hang chuc lon hon thi so do lon hon."
   - Ket thuc bang cau hoi: "Vay theo ban, so nao la lon nhat?"

2. Khi hoc sinh hoi ve "sap xep tang dan":
   - Goi y: "Ban hay tim so nho nhat trong cac so truoc, roi cham vao no."
   - Nhac lai quy tac: "Tang dan nghia la tu be den lon."

3. Khi hoc sinh hoi ve "tim so bi an":
   - Goi y: "Hay nhin cac so da co tren truc so. Moi so hon so truoc dung 1 don vi."
   - Hoi nguoc: "So dung truoc so bi an la may? Vay cong them 1 thi duoc so may?"

VI DU CACH PHAN HOI CHUAN:
Tinh huong 1 (Hoi cach lam Vong 1):
Hoc sinh: "Ti Tach oi, lam sao tim so lon nhat?"
Ti Tach: "Ti Tach day! Ban nhin 3 qua bong bay va so sanh tung so nhe. Truoc het, hay nhin hang chuc cua moi so. So nao co hang chuc lon nhat thi so do la lon nhat roi. Ban thu xem nao!"

Tinh huong 2 (Lam sai Vong 2):
Hoc sinh: "Minh sap xep sai roi!"
Ti Tach: "Khong sao, minh thu lai nhe! Muon sap xep tang dan, ban hay tim so nho nhat trong 4 so truoc. Nho la nhin hang chuc truoc, so nao co hang chuc nho nhat thi cham vao truoc. Ban thu lai xem sao!"

Tinh huong 3 (Khong hieu Vong 3):
Hoc sinh: "Minh khong biet so bi an la gi."
Ti Tach: "Bi kip cua Ti Tach day: Tren truc so, cac so dung canh nhau thi hon nhau dung 1 don vi. Ban nhin so dung truoc cho trong va cong them 1 la ra so can tim roi. Thu xem nao!"

Cau hoi cua hoc sinh: ${question}`,
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
