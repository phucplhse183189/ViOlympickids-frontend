import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "@vercel/postgres";

async function main() {
  console.log("🌱 Seeding feedback data...\n");

  // 1. Lấy danh sách parent users để gắn feedback
  const { rows: parents } = await sql`
    SELECT id, name FROM users WHERE role = 'parent' ORDER BY created_at ASC
  `;

  if (parents.length < 2) {
    console.error("❌ Cần ít nhất 2 tài khoản parent trong DB để seed feedback!");
    process.exit(1);
  }

  console.log(`✅ Tìm thấy ${parents.length} parent users`);

  // 2. Tạo feedback posts
  const feedbackData = [
    {
      userId: parents[0].id,
      rating: 5,
      content: "Con mình từ khi học trên ViOlympicKids thì yêu thích Toán hẳn ra! Bé tự giác học mỗi ngày mà không cần nhắc nhở. Giao diện 3D rất hấp dẫn, con cứ đòi \"chơi Toán\" suốt 😂",
    },
    {
      userId: parents[1].id,
      rating: 5,
      content: "Mình là giáo viên Toán, thấy phương pháp dạy trên ViOlympicKids rất khoa học. Trực quan hóa bằng 3D giúp các bé hiểu sâu hơn thay vì học thuộc lòng. Giá cả cũng rất phải chăng!",
    },
    {
      userId: parents.length > 2 ? parents[2].id : parents[0].id,
      rating: 4,
      content: "Bé nhà mình lớp 2, từ khi dùng app thì điểm Toán cải thiện rõ rệt. Đặc biệt phần AI đọc đề rất hay, bé chưa đọc thông nhưng vẫn tự làm bài được. Mong team bổ sung thêm nhiều bài tập hơn!",
    },
    {
      userId: parents.length > 3 ? parents[3].id : parents[1].id,
      rating: 5,
      content: "Tuyệt vời! Mình bận cả ngày không có thời gian kèm con, nhưng nhờ ViOlympicKids mà con vẫn học tốt. Report hàng ngày gửi về điện thoại giúp mình nắm được tiến độ con rất tiện.",
    },
    {
      userId: parents[0].id,
      rating: 5,
      content: "So với việc cho con đi học thêm 800k-1tr5/tháng thì ViOlympicKids chỉ 60k/tháng mà con lại thích học hơn. Bé bảo \"mẹ ơi con muốn học Toán 3D\" mỗi tối 🥰",
    },
    {
      userId: parents[1].id,
      rating: 4,
      content: "Giao diện đẹp, dễ dùng. Con mình 6 tuổi mà tự thao tác được luôn. Chỉ có điều mình muốn thêm chức năng offline để con học khi không có mạng. Còn lại thì perfect! 👍",
    },
    {
      userId: parents.length > 2 ? parents[2].id : parents[0].id,
      rating: 5,
      content: "Hai bé nhà mình đều dùng chung tài khoản, rất tiện quản lý. Phần bảng xếp hạng thi đua giúp 2 bé thi nhau học, vui lắm! Cảm ơn đội ngũ ViOlympicKids ❤️",
    },
    {
      userId: parents.length > 3 ? parents[3].id : parents[1].id,
      rating: 5,
      content: "Mình đã thử nhiều app học Toán cho bé nhưng ViOlympicKids là tốt nhất! Phần hình học không gian 3D giúp con hiểu ngay, không cần giải thích dài dòng. Highly recommend cho các bố mẹ! 🌟",
    },
  ];

  const insertedPosts = [];
  for (const fb of feedbackData) {
    const { rows } = await sql`
      INSERT INTO feedback_posts (user_id, rating, content, likes_count)
      VALUES (${fb.userId}, ${fb.rating}, ${fb.content}, ${Math.floor(Math.random() * 15) + 1})
      RETURNING id
    `;
    insertedPosts.push(rows[0].id);
    console.log(`  ✅ Created feedback post ${rows[0].id}`);
  }

  // 3. Tạo replies cho một số posts
  const replies = [
    {
      postId: insertedPosts[0],
      userId: parents[1].id,
      content: "Đúng rồi chị! Bé nhà em cũng vậy, cứ đòi \"chơi Toán\" thay vì xem hoạt hình 😄",
    },
    {
      postId: insertedPosts[0],
      userId: parents.length > 2 ? parents[2].id : parents[0].id,
      content: "Con mình cũng thế! Mừng quá luôn ạ, trước giờ ép con học Toán khó lắm 🎉",
    },
    {
      postId: insertedPosts[1],
      userId: parents[0].id,
      content: "Cô ơi cho em hỏi bé nhà em lớp 2 thì nên bắt đầu từ chủ đề nào ạ?",
    },
    {
      postId: insertedPosts[1],
      userId: parents[1].id,
      content: "Bé lớp 2 nên bắt đầu từ phần Hình học cơ bản và Phép cộng trừ nha. Giao diện 3D sẽ giúp bé hứng thú ngay ạ! 💪",
    },
    {
      postId: insertedPosts[3],
      userId: parents[0].id,
      content: "Em cũng vậy, report hàng ngày tiện thiệt. Biết con mạnh yếu chỗ nào để hỗ trợ thêm!",
    },
    {
      postId: insertedPosts[4],
      userId: parents.length > 3 ? parents[3].id : parents[1].id,
      content: "60k/tháng mà con học vui vẻ thế này thì quá xứng đáng rồi! 💯",
    },
    {
      postId: insertedPosts[6],
      userId: parents[1].id,
      content: "Hay quá! 2 bé thi nhau thì động lực cao hơn rồi, mình cũng muốn thêm bé thứ 2 vào 😊",
    },
  ];

  for (const reply of replies) {
    await sql`
      INSERT INTO feedback_replies (post_id, user_id, content)
      VALUES (${reply.postId}, ${reply.userId}, ${reply.content})
    `;
    console.log(`  💬 Created reply for post ${reply.postId}`);
  }

  console.log("\n🎉 Seeding feedback hoàn tất!");
  console.log(`   📝 ${feedbackData.length} feedback posts`);
  console.log(`   💬 ${replies.length} replies`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
