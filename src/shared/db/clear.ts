import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema.js";

const db = drizzle(sql, { schema });

async function clearAndInit() {
  console.log("Bắt đầu xóa dữ liệu (giữ lại cấu trúc và các bài học/câu hỏi)...");

  // Xóa theo thứ tự để tránh vi phạm khóa ngoại (foreign key constraints)
  await db.delete(schema.feedbackReplies);
  await db.delete(schema.feedbackLikes);
  await db.delete(schema.feedbackPosts);
  await db.delete(schema.paymentOrders);
  await db.delete(schema.passwordResetTokens);
  await db.delete(schema.pageViews);
  await db.delete(schema.quizAttempts);
  await db.delete(schema.completedLessons);
  await db.delete(schema.alerts);
  await db.delete(schema.transactions);
  await db.delete(schema.billing);
  await db.delete(schema.streakDaysTable);
  await db.delete(schema.weeklyTrends);
  await db.delete(schema.studyDays);
  await db.delete(schema.radarSkills);
  await db.delete(schema.skills);
  await db.delete(schema.activities);
  await db.delete(schema.dashboardStats);
  await db.delete(schema.children);
  await db.delete(schema.users);

  console.log("Đã xóa toàn bộ dữ liệu người dùng, quá trình học và thanh toán.");

  // Tạo 2 tài khoản Admin
  console.log("Đang tạo 2 tài khoản Admin mới...");
  const adminHash1 = await bcrypt.hash("admin123", 10);
  const adminHash2 = await bcrypt.hash("admin456", 10);

  await db.insert(schema.users).values([
    {
      phone: "0999999991",
      passwordHash: adminHash1,
      name: "Admin ViOlympicKids 1",
      email: "admin1@violympickids.com",
      role: "admin",
      status: "active",
    },
    {
      phone: "0999999992",
      passwordHash: adminHash2,
      name: "Admin ViOlympicKids 2",
      email: "admin2@violympickids.com",
      role: "admin",
      status: "active",
    },
  ]);

  console.log("Đã tạo thành công 2 tài khoản Admin:");
  console.log("1. Số điện thoại: 0999999991 | Mật khẩu: admin123");
  console.log("2. Số điện thoại: 0999999992 | Mật khẩu: admin456");
  
  await sql.end();
  console.log("Hoàn tất!");
  process.exit(0);
}

clearAndInit().catch((err) => {
  console.error("Lỗi trong quá trình xóa dữ liệu:", err);
  process.exit(1);
});
