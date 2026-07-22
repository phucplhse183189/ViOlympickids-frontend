import type { VercelRequest, VercelResponse } from "@vercel/node";
import { count } from "drizzle-orm";
import { db, schema } from "../_db.js";

/**
 * GET /api/admin/seed-lessons
 * Tự động tạo 75 bài học Toán lớp 2 vào CSDL nếu chưa có.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [{ cnt }] = await db.select({ cnt: count() }).from(schema.lessons);
    if (Number(cnt) >= 75) {
      return res.status(200).json({ message: "Dữ liệu 75 bài học đã tồn tại!" });
    }

    const topicData = [
      { topicNumber: 1, title: "Ôn tập và bổ sung", color: "from-orange-400 to-amber-300", accent: "text-orange-700", emoji: "📖" },
      { topicNumber: 2, title: "Phép cộng, phép trừ qua 10 trong phạm vi 20", color: "from-sky-400 to-cyan-300", accent: "text-sky-700", emoji: "🚀" },
      { topicNumber: 3, title: "Làm quen với khối lượng, dung tích", color: "from-emerald-400 to-green-300", accent: "text-emerald-700", emoji: "⚖️" },
      { topicNumber: 4, title: "Phép cộng, phép trừ (có nhớ) trong phạm vi 100", color: "from-violet-400 to-purple-300", accent: "text-violet-700", emoji: "🧠" },
      { topicNumber: 5, title: "Làm quen với hình phẳng", color: "from-pink-400 to-rose-300", accent: "text-pink-700", emoji: "📐" },
      { topicNumber: 6, title: "Ngày – giờ, giờ – phút, ngày – tháng", color: "from-amber-400 to-yellow-300", accent: "text-amber-700", emoji: "🕐" },
      { topicNumber: 7, title: "Ôn tập học kì 1", color: "from-red-400 to-orange-300", accent: "text-red-700", emoji: "🎓" },
      { topicNumber: 8, title: "Phép nhân, phép chia", color: "from-teal-400 to-emerald-300", accent: "text-teal-700", emoji: "✖️" },
      { topicNumber: 9, title: "Làm quen với hình khối", color: "from-indigo-400 to-blue-300", accent: "text-indigo-700", emoji: "🧊" },
      { topicNumber: 10, title: "Các số trong phạm vi 1 000", color: "from-cyan-400 to-sky-300", accent: "text-cyan-700", emoji: "🔟" },
      { topicNumber: 11, title: "Độ dài và đơn vị đo độ dài. Tiền Việt Nam", color: "from-lime-400 to-green-300", accent: "text-lime-700", emoji: "📏" },
      { topicNumber: 12, title: "Phép cộng, phép trừ trong phạm vi 1 000", color: "from-fuchsia-400 to-pink-300", accent: "text-fuchsia-700", emoji: "🚀" },
      { topicNumber: 13, title: "Làm quen với yếu tố thống kê, xác suất", color: "from-orange-400 to-yellow-300", accent: "text-orange-700", emoji: "📊" },
      { topicNumber: 14, title: "Ôn tập cuối năm", color: "from-red-400 to-rose-300", accent: "text-red-700", emoji: "🎓" },
    ];

    await db.insert(schema.topics).values(topicData).onConflictDoNothing();

    const dbTopics = await db.select().from(schema.topics);
    const topicMap = new Map(dbTopics.map(t => [t.topicNumber, t.id]));

    type LessonTuple = [number, number, string, string | null, string, string, "FREE" | "PRO" | "VIP"];
    const allLessons: LessonTuple[] = [
      [1,1,"Bài 1: Ôn tập các số đến 100","number-review-game","🔢","Ôn tập cấu tạo số, đọc, viết và so sánh các số đến 100.","FREE"],
      [1,2,"Tia số. Số liền trước, số liền sau","number-sequence-chart","📊","Tìm quy luật dãy số và điền số còn thiếu trên biểu đồ cột.","FREE"],
      [1,3,"Các thành phần của phép cộng, phép trừ",null,"➕","Nhận biết số hạng, tổng, số bị trừ, số trừ, hiệu.","FREE"],
      [1,4,"Hơn, kém nhau bao nhiêu",null,"⚖️","So sánh hai số và tìm xem hơn/kém nhau bao nhiêu đơn vị.","FREE"],
      [1,5,"Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100","pipe-balance-game","🧮","Luyện tập phép cộng, trừ không nhớ — game nối ống.","FREE"],
      [1,6,"Luyện tập chung","matific-canvas-game","🎮","Game kéo thả số kiểu Matific để tổng hợp kỹ năng chủ đề 1.","FREE"],
      [2,7,"Phép cộng (qua 10) trong phạm vi 20","add-across-ten-game","🌟","Tìm hiểu cách cộng qua 10.","FREE"],
      [2,8,"Bảng cộng (qua 10)",null,"📋","Học thuộc bảng cộng qua 10 trong phạm vi 20.","PRO"],
      [2,9,"Bài toán về thêm, bớt một số đơn vị",null,"🎯","Giải bài toán có lời văn dạng thêm, bớt.","PRO"],
      [2,10,"Luyện tập chung",null,"🏋️","Luyện tập tổng hợp phép cộng, trừ qua 10.","PRO"],
      [2,11,"Phép trừ (qua 10) trong phạm vi 20",null,"➖","Tìm hiểu cách trừ qua 10.","PRO"],
      [2,12,"Bảng trừ (qua 10)",null,"📋","Học thuộc bảng trừ qua 10 trong phạm vi 20.","PRO"],
      [2,13,"Bài toán về nhiều hơn, ít hơn một số đơn vị",null,"📝","Giải bài toán có lời văn dạng nhiều hơn, ít hơn.","PRO"],
      [2,14,"Luyện tập chung",null,"🏋️","Tổng hợp các dạng bài tập của chủ đề 2.","PRO"],
      [3,15,"Ki-lô-gam",null,"🏷️","Làm quen với đơn vị đo khối lượng kg.","PRO"],
      [3,16,"Lít",null,"🥛","Làm quen với đơn vị đo dung tích lít.","PRO"],
      [3,17,"Thực hành và trải nghiệm với kg, lít",null,"🔬","Thực hành cân, đo.","PRO"],
      [3,18,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 3.","PRO"],
      [4,19,"Phép cộng (có nhớ) hai chữ số + một chữ số",null,"🔢","Cộng có nhớ dạng 27 + 5.","PRO"],
      [4,20,"Phép cộng (có nhớ) hai chữ số + hai chữ số",null,"➕","Cộng có nhớ dạng 38 + 25.","PRO"],
      [4,21,"Luyện tập chung",null,"🏋️","Luyện tập phép cộng có nhớ.","PRO"],
      [4,22,"Phép trừ (có nhớ) hai chữ số - một chữ số",null,"➖","Trừ có nhớ dạng 43 − 7.","PRO"],
      [4,23,"Phép trừ (có nhớ) hai chữ số - hai chữ số",null,"➖","Trừ có nhớ dạng 52 − 28.","PRO"],
      [4,24,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 4.","PRO"],
      [5,25,"Điểm, đoạn thẳng, đường thẳng, đường cong",null,"📏","Nhận biết hình học cơ bản.","PRO"],
      [5,26,"Đường gấp khúc. Hình tứ giác",null,"🔶","Nhận biết đường gấp khúc và hình tứ giác.","PRO"],
      [5,27,"Thực hành gấp, cắt, ghép, xếp hình",null,"✂️","Thực hành hình học.","PRO"],
      [5,28,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 5.","PRO"],
      [6,29,"Ngày – giờ, giờ – phút","time-lab-game","⏰","Đơn vị thời gian.","PRO"],
      [6,30,"Ngày – tháng",null,"📅","Tìm hiểu ngày trong tháng.","PRO"],
      [6,31,"Thực hành xem đồng hồ, xem lịch",null,"🔬","Thực hành thời gian.","PRO"],
      [6,32,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 6.","PRO"],
      [7,33,"Ôn tập phép cộng, trừ phạm vi 20, 100",null,"🔢","Ôn lại cộng trừ.","PRO"],
      [7,34,"Ôn tập hình phẳng",null,"📐","Ôn lại hình phẳng.","PRO"],
      [7,35,"Ôn tập đo lường",null,"📏","Ôn lại đo lường.","PRO"],
      [7,36,"Ôn tập chung",null,"🏋️","Tổng hợp ôn tập HK1.","PRO"],
      [8,37,"Phép nhân",null,"✖️","Làm quen phép nhân.","PRO"],
      [8,38,"Thừa số, tích",null,"🔢","Nhận biết thừa số và tích.","PRO"],
      [8,39,"Bảng nhân 2",null,"2️⃣","Học thuộc bảng nhân 2.","PRO"],
      [8,40,"Bảng nhân 5",null,"5️⃣","Học thuộc bảng nhân 5.","PRO"],
      [8,41,"Phép chia",null,"➗","Làm quen phép chia.","PRO"],
      [8,42,"Số bị chia, số chia, thương",null,"🔢","Nhận biết thành phần phép chia.","PRO"],
      [8,43,"Bảng chia 2",null,"2️⃣","Học thuộc bảng chia 2.","PRO"],
      [8,44,"Bảng chia 5",null,"5️⃣","Học thuộc bảng chia 5.","PRO"],
      [8,45,"Luyện tập chung",null,"🏋️","Tổng hợp nhân chia.","PRO"],
      [9,46,"Mô phỏng 3D: Mở khối trụ, tách khối cầu","math2-quiz-3d","🏀","Không gian 3D tương tác.","FREE"],
      [9,47,"Luyện tập chung",null,"🏋️","Tổng hợp hình khối.","PRO"],
      [10,48,"Đơn vị, chục, trăm, nghìn",null,"🔢","Nhận biết hàng.","PRO"],
      [10,49,"Các số tròn trăm, tròn chục",null,"💯","Đọc viết số tròn.","PRO"],
      [10,50,"So sánh các số tròn trăm, tròn chục",null,"⚖️","So sánh số.","PRO"],
      [10,51,"Số có ba chữ số",null,"🔢","Đọc, viết số 3 chữ số.","PRO"],
      [10,52,"Viết số thành tổng trăm, chục, đơn vị",null,"📝","Phân tích số.","PRO"],
      [10,53,"So sánh các số có ba chữ số",null,"⚖️","So sánh.","PRO"],
      [10,54,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 10.","PRO"],
      [11,55,"Đề-xi-mét. Mét. Ki-lô-mét",null,"📐","Đơn vị đo độ dài.","PRO"],
      [11,56,"Giới thiệu tiền Việt Nam",null,"💰","Nhận biết tiền VN.","PRO"],
      [11,57,"Thực hành đo độ dài",null,"🔬","Thực hành.","PRO"],
      [11,58,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 11.","PRO"],
      [12,59,"Phép cộng (không nhớ) phạm vi 1 000",null,"➕","Cộng không nhớ.","PRO"],
      [12,60,"Phép cộng (có nhớ) phạm vi 1 000",null,"➕","Cộng có nhớ.","PRO"],
      [12,61,"Phép trừ (không nhớ) phạm vi 1 000",null,"➖","Trừ không nhớ.","PRO"],
      [12,62,"Phép trừ (có nhớ) phạm vi 1 000",null,"➖","Trừ có nhớ.","PRO"],
      [12,63,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 12.","PRO"],
      [13,64,"Thu thập, phân loại, kiểm đếm số liệu",null,"📋","Thu thập số liệu.","PRO"],
      [13,65,"Biểu đồ tranh",null,"🖼️","Đọc và vẽ biểu đồ.","PRO"],
      [13,66,"Chắc chắn, có thể, không thể",null,"🎲","Nhận biết xác suất.","PRO"],
      [13,67,"Thực hành thu thập số liệu",null,"🔬","Thực hành.","PRO"],
      [14,68,"Ôn tập số phạm vi 1 000",null,"🔢","Ôn lại số.","PRO"],
      [14,69,"Ôn tập cộng trừ phạm vi 100",null,"➕","Ôn lại cộng trừ.","PRO"],
      [14,70,"Ôn tập cộng trừ phạm vi 1 000",null,"🧮","Ôn lại.","PRO"],
      [14,71,"Ôn tập phép nhân, phép chia",null,"✖️","Ôn lại nhân chia.","PRO"],
      [14,72,"Ôn tập hình học",null,"📐","Ôn lại hình.","PRO"],
      [14,73,"Ôn tập đo lường",null,"📏","Ôn lại đo lường.","PRO"],
      [14,74,"Ôn tập kiểm đếm và xác suất",null,"📊","Ôn lại thống kê.","PRO"],
      [14,75,"Ôn tập chung",null,"🏋️","Tổng hợp ôn tập cả năm.","PRO"],
    ];

    const lessonValues = allLessons.map(([tn, ln, title, gt, emoji, desc, plan]) => {
      const topicId = topicMap.get(tn);
      if (!topicId) throw new Error(`Không tìm thấy topicId cho topicNumber ${tn}`);
      return {
        topicId,
        lessonNumber: ln,
        title,
        gameType: gt,
        emoji,
        description: desc,
        requiredPlan: plan,
      };
    });

    await db.insert(schema.lessons).values(lessonValues).onConflictDoNothing();

    return res.status(200).json({ success: true, message: "Đã tạo 75 bài học thành công!" });
  } catch (err: any) {
    console.error("Seed lessons error:", err);
    return res.status(500).json({ error: err.message || "Lỗi tạo bài học" });
  }
}
