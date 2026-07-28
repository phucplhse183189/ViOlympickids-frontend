import dotenv from "dotenv";
import { sql } from "@vercel/postgres";

dotenv.config({ path: ".env.local" });

type FeedbackSeed = {
  rating: number;
  category: "interface" | "feature" | "content" | "performance" | "support" | "general";
  content: string;
};

const feedbacks: FeedbackSeed[] = [
  { rating: 4, category: "content", content: "Bé nhà mình khá thích hình ảnh và cách trình bày bài học vì nhìn giống trò chơi. Sau vài buổi bé bắt đầu không còn hào hứng như lúc đầu. Mình mong có nhiều dạng câu hỏi đố và trò chơi khác nhau hơn" },
  { rating: 4, category: "content", content: "Phần bài học nhiều màu sắc và bám sát chương trình học. Bé hứng thú hơn so với khi chỉ nhìn vào sách giáo khoa. Điểm chưa tốt là các bài luyện tập vẫn hơi giống nhau, nếu học liên tục vài ngày thì bé dễ đoán được cách làm mà chưa chắc đã hiểu sâu" },
  { rating: 3, category: "content", content: "Bài học được chia thành từng phần ngắn nên bé không cảm thấy quá áp lực. Có bài quá dễ nhưng sau đó lại chuyển sang bài khá khó khiến con mình dễ nản" },
  { rating: 4, category: "feature", content: "Bé rất thích nhân vật và hình ảnh minh họa trong bài, mình thấy hình thức tương tác chưa đa dạng nên sau một thời gian bé không còn hào hứng như những ngày đầu" },
  { rating: 4, category: "content", content: "Bé tập trung hơn so với học bằng sách vì có hình ảnh và thao tác trực tiếp. Mình mong hệ thống bổ sung thêm câu hỏi để bé được luyện nhiều tình huống khác nhau" },
  { rating: 5, category: "interface", content: "Giao diện nhiều màu sắc, bé có thể tự chọn bài học" },
  { rating: 4, category: "content", content: "Bài học sinh động và không tạo cảm giác đang học thêm. Độ khó giữa các câu chưa thật sự liền mạch" },
  { rating: 3, category: "content", content: "Mình đánh giá cao cách giải thích bằng hình ảnh vì bé dễ hình dung phép tính hơn. Điểm hạn chế là khi bé làm sai, phần giải thích còn khá ngắn. Bé biết đáp án đúng nhưng chưa hiểu rõ tại sao mình sai." },
  { rating: 5, category: "content", content: "Các bài học ngắn rất phù hợp. Bé có thể học khoảng 5 phút mỗi ngày để ôn tập" },
  { rating: 4, category: "feature", content: "Bé có hứng thú hơn với môn toán sau khi trải nghiệm, đặc biệt là các bài có hình ảnh và hiệu ứng. Tôi mong hệ thống cá nhân hóa tốt hơn, chẳng hạn bé yếu phép trừ thì nên được luyện thêm phép trừ thay vì tiếp tục chuyển sang chủ đề khác" },
  { rating: 3, category: "feature", content: "Khi đăng nhập trên thiết bị khác mình phải nhập lại thông tin nhiều lần. Nếu hệ thống ghi nhớ tài khoản thì sẽ thuận tiện hơn" },
  { rating: 5, category: "feature", content: "Tôi có thể theo dõi tiến độ, biết bé đang làm tốt và yếu bài nào, rất hữu ích" },
  { rating: 4, category: "feature", content: "Mình mong có thể dùng được trên điện thoại để thuận tiện hơn" },
  { rating: 5, category: "interface", content: "Bài học phù hợp nhiều màu sắc và không có quá nhiều quảng cáo nên mình cảm thấy yên tâm khi cho bé sử dụng" },
  { rating: 4, category: "support", content: "Hỗ trợ nhiệt tình và hướng dẫn mình đăng ký từng bước. Nếu có phần hướng dẫn tự động hoặc câu hỏi thường gặp thì sẽ tiện hơn" },
  { rating: 3, category: "interface", content: "Bé rất thích khi được động viên nhưng có vài âm thanh hơi lớn và lặp lại nhiều lần nên có thể cảm thấy khó chịu" },
  { rating: 4, category: "content", content: "Nội dung Toán theo mình thấy sát kiến thức lớp 2 nên bé nhà mình có thể ôn lại bài đã học ở trường. Tuy nhiên, một số chủ đề chưa có nhiều bài nâng cao như mình kỳ vọng ở gói VIP. Mình mong phần nâng cao có thêm các bài toán tư duy và bài toán thực tế" },
  { rating: 4, category: "feature", content: "Bé có thể tự học mà không cần bố mẹ ngồi cạnh trong toàn bộ thời gian, đây là điểm mình thấy rất tiện. Tuy nhiên, hệ thống chưa có nhắc nhở nghỉ mắt hoặc giới hạn thời gian học nên mình vẫn phải chủ động theo dõi" },
  { rating: 4, category: "feature", content: "Mình thích cách chương trình khuyến khích bé hoàn thành từng bài nhỏ vì bé cảm thấy có thành tích. Tuy nhiên, phần huy hiệu và phần thưởng chưa thật sự hấp dẫn. Nếu bé có thể tích điểm hay nhận quà thì sẽ có động lực hơn" },
  { rating: 3, category: "interface", content: "Các bước chọn bài đơn giản và con mình có thể sử dụng sau một lần được hướng dẫn. Trang chủ có hơi nhiều thông tin đối với con. Mình nghĩ nên làm nổi bật nút ‘Tiếp tục bài đang học’ để con biết cần bắt đầu từ đâu" },
  { rating: 2, category: "performance", content: "Phụ thuộc khá nhiều vào wifi. Khi wifi yếu, bài tải chậm dễ lắc khiến bé mất tập trung và không muốn tiếp tục học." },
  { rating: 5, category: "general", content: "Bé được học toán tại nhà với chi phí rẻ, bổ ích" },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { rows: parents } = await sql.query<{ id: string; name: string }>(
    "SELECT id, name FROM users WHERE role = 'parent' AND status = 'active' ORDER BY created_at ASC",
  );

  if (parents.length === 0) throw new Error("Không tìm thấy tài khoản phụ huynh test đang hoạt động.");

  const { rows: existingRows } = await sql.query<{ content: string }>(
    "SELECT content FROM feedback_posts",
  );
  const existing = new Set(existingRows.map(({ content }) => content.trim().toLocaleLowerCase("vi")));
  const missing = feedbacks.filter((item) => !existing.has(item.content.trim().toLocaleLowerCase("vi")));

  console.log(`Tìm thấy ${parents.length} tài khoản phụ huynh đang hoạt động.`);
  console.log(`${missing.length}/${feedbacks.length} feedback cần thêm.`);
  if (dryRun || missing.length === 0) return;

  for (const [index, item] of missing.entries()) {
    const parent = parents[index % parents.length];
    await sql.query(
      `INSERT INTO feedback_posts (user_id, rating, category, content, status, likes_count)
       VALUES ($1, $2, $3, $4, 'pending', 0)`,
      [parent.id, item.rating, item.category, item.content],
    );
  }

  console.log(`Đã thêm ${missing.length} feedback ở trạng thái chờ duyệt vào trang admin.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
