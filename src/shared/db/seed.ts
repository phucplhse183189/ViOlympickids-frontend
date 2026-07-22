/**
 * ============================================================
 *  SEED SCRIPT — Chuyển toàn bộ mock data vào Vercel Postgres
 *  Chạy: npx dotenv -e .env.local -- npx tsx src/shared/db/seed.ts
 * ============================================================
 */
import "dotenv/config";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Bắt đầu seed database...\n");

  // ══════════════════════════════════════════════════════════════
  // 1. TẠO USERS (Admin + Parents)
  // ══════════════════════════════════════════════════════════════
  console.log("👤 Tạo users...");
  const adminHash = await bcrypt.hash("admin123", 10);
  const parentHash = await bcrypt.hash("demo123", 10);

  await db
    .insert(schema.users)
    .values({
      phone: "0938471256",
      passwordHash: adminHash,
      name: "Admin ViOlympicKids",
      avatarInitials: "AD",
      role: "admin",
    })
    .returning();

  const [parent1] = await db
    .insert(schema.users)
    .values({
      phone: "0912345678",
      passwordHash: parentHash,
      name: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      avatarInitials: "NA",
      avatarId: "panda",
      role: "parent",
      unreadNotifications: 3,
    })
    .returning();

  const [parent2] = await db
    .insert(schema.users)
    .values({
      phone: "0987654321",
      passwordHash: parentHash,
      name: "Trần Thị Bình",
      email: "binh.tran@yahoo.com",
      avatarInitials: "TB",
      role: "parent",
    })
    .returning();

  const [parent3] = await db
    .insert(schema.users)
    .values({
      phone: "0909111222",
      passwordHash: parentHash,
      name: "Lê Hoàng Dũng",
      email: "dung.le@hotmail.com",
      avatarInitials: "LD",
      role: "parent",
    })
    .returning();

  const [parent4] = await db
    .insert(schema.users)
    .values({
      phone: "0933444555",
      passwordHash: parentHash,
      name: "Phạm Thanh Hà",
      email: "ha.pham@gmail.com",
      avatarInitials: "PH",
      role: "parent",
    })
    .returning();

  const [parent5] = await db
    .insert(schema.users)
    .values({
      phone: "0977888999",
      passwordHash: parentHash,
      name: "Võ Minh Tuấn",
      email: "tuan.vo@outlook.com",
      avatarInitials: "VT",
      role: "parent",
      status: "suspended",
    })
    .returning();

  const [parent6] = await db
    .insert(schema.users)
    .values({
      phone: "0866222333",
      passwordHash: parentHash,
      name: "Đặng Thùy Linh",
      email: "linh.dang@gmail.com",
      avatarInitials: "DL",
      role: "parent",
    })
    .returning();

  console.log(`  ✅ ${7} users created (1 admin + 6 parents)`);

  // ══════════════════════════════════════════════════════════════
  // 2. TẠO CHILDREN
  // ══════════════════════════════════════════════════════════════
  console.log("👶 Tạo children...");

  // Parent 1 — 3 bé (dùng cho dashboard)
  const [child1] = await db.insert(schema.children).values({ parentId: parent1.id, name: "Nguyễn Bé Na", grade: "Lớp 2", avatarEmoji: "👧", avatarBg: "#f97316", plan: "PRO", planDaysLeft: 25, gender: "girl", totalLessons: 48, avgScore: 82 }).returning();
  const [child2] = await db.insert(schema.children).values({ parentId: parent1.id, name: "Nguyễn Bé Bin", grade: "Lớp 2", avatarEmoji: "🧒", avatarBg: "#8b5cf6", plan: "VIP", planDaysLeft: 200, gender: "boy", totalLessons: 95, avgScore: 95 }).returning();
  const [child3] = await db.insert(schema.children).values({ parentId: parent1.id, name: "Bé Mèo", grade: "Lớp 2", avatarEmoji: "🐱", avatarBg: "#3b82f6", plan: "FREE", gender: "girl", totalLessons: 10, avgScore: 45 }).returning();

  // Parent 2
  await db.insert(schema.children).values({ parentId: parent2.id, name: "Trần Minh Khôi", grade: "Lớp 2", avatarEmoji: "🦊", plan: "PRO", gender: "boy", totalLessons: 35, avgScore: 78 });

  // Parent 3
  await db.insert(schema.children).values([
    { parentId: parent3.id, name: "Lê Bảo Ngọc", grade: "Lớp 2", avatarEmoji: "🦋", plan: "VIP", gender: "girl", totalLessons: 120, avgScore: 91 },
    { parentId: parent3.id, name: "Lê Gia Huy", grade: "Lớp 2", avatarEmoji: "🐯", plan: "VIP", gender: "boy", totalLessons: 88, avgScore: 87 },
    { parentId: parent3.id, name: "Lê Minh Anh", grade: "Lớp 2", avatarEmoji: "🐬", plan: "FREE", gender: "girl", status: "inactive", totalLessons: 10, avgScore: 55 },
  ]);

  // Parent 4
  await db.insert(schema.children).values({ parentId: parent4.id, name: "Phạm Đức Anh", grade: "Lớp 2", avatarEmoji: "🐼", plan: "FREE", gender: "boy", totalLessons: 5, avgScore: 60 });

  // Parent 5
  await db.insert(schema.children).values({ parentId: parent5.id, name: "Võ Khánh Linh", grade: "Lớp 2", avatarEmoji: "🦄", plan: "PRO", gender: "girl", status: "suspended", totalLessons: 22, avgScore: 70 });

  // Parent 6
  await db.insert(schema.children).values([
    { parentId: parent6.id, name: "Đặng Quốc Bảo", grade: "Lớp 2", avatarEmoji: "🐸", plan: "FREE", gender: "boy", totalLessons: 8, avgScore: 65 },
    { parentId: parent6.id, name: "Đặng Mai Phương", grade: "Lớp 2", avatarEmoji: "🐰", plan: "PRO", gender: "girl", totalLessons: 15, avgScore: 73 },
  ]);

  console.log(`  ✅ 10 children created`);

  // ══════════════════════════════════════════════════════════════
  // 3. DASHBOARD STATS (cho 3 bé chính)
  // ══════════════════════════════════════════════════════════════
  console.log("📊 Tạo dashboard stats...");

  await db.insert(schema.dashboardStats).values([
    { childId: child1.id, weeklyMinutes: 100, weeklyMinutesPctChange: 15, completedLessons: 5, completedLessonsLabel: "Tuần này", bestSkill: "Phép cộng", overallScore: 82, streakDays: 7 },
    { childId: child2.id, weeklyMinutes: 210, weeklyMinutesPctChange: 22, completedLessons: 28, completedLessonsLabel: "Tuần này", bestSkill: "Tư duy logic", overallScore: 95, streakDays: 14 },
    { childId: child3.id, weeklyMinutes: 35, weeklyMinutesPctChange: -5, completedLessons: 3, completedLessonsLabel: "Tuần này", bestSkill: "Nhận dạng số", overallScore: 45, streakDays: 1 },
  ]);
  console.log("  ✅ Dashboard stats created");

  // ══════════════════════════════════════════════════════════════
  // 4. STUDY DAYS
  // ══════════════════════════════════════════════════════════════
  console.log("📅 Tạo study days...");

  const child1StudyDays = [{ day: "T2", minutes: 20 }, { day: "T3", minutes: 35 }, { day: "T4", minutes: 15 }, { day: "T5", minutes: 40 }, { day: "T6", minutes: 30 }, { day: "T7", minutes: 50 }, { day: "CN", minutes: 25 }];
  const child2StudyDays = [{ day: "T2", minutes: 45 }, { day: "T3", minutes: 30 }, { day: "T4", minutes: 25 }, { day: "T5", minutes: 50 }, { day: "T6", minutes: 35 }, { day: "T7", minutes: 15 }, { day: "CN", minutes: 10 }];
  const child3StudyDays = [{ day: "T2", minutes: 10 }, { day: "T3", minutes: 0 }, { day: "T4", minutes: 5 }, { day: "T5", minutes: 0 }, { day: "T6", minutes: 10 }, { day: "T7", minutes: 10 }, { day: "CN", minutes: 0 }];

  await db.insert(schema.studyDays).values([
    ...child1StudyDays.map((d) => ({ childId: child1.id, ...d })),
    ...child2StudyDays.map((d) => ({ childId: child2.id, ...d })),
    ...child3StudyDays.map((d) => ({ childId: child3.id, ...d })),
  ]);
  console.log("  ✅ Study days created");

  // ══════════════════════════════════════════════════════════════
  // 5. WEEKLY TRENDS
  // ══════════════════════════════════════════════════════════════
  console.log("📈 Tạo weekly trends...");

  const weeks = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"];
  const child1Scores = [72, 78, 75, 82, 88, 85, 91];
  const child2Scores = [88, 90, 87, 92, 94, 93, 97];
  const child3Scores = [40, 42, 38, 45, 43, 44, 46];

  await db.insert(schema.weeklyTrends).values([
    ...weeks.map((w, i) => ({ childId: child1.id, week: w, score: child1Scores[i] })),
    ...weeks.map((w, i) => ({ childId: child2.id, week: w, score: child2Scores[i] })),
    ...weeks.map((w, i) => ({ childId: child3.id, week: w, score: child3Scores[i] })),
  ]);
  console.log("  ✅ Weekly trends created");

  // ══════════════════════════════════════════════════════════════
  // 6. SKILLS
  // ══════════════════════════════════════════════════════════════
  console.log("🎯 Tạo skills...");

  await db.insert(schema.skills).values([
    { childId: child1.id, label: "Số học", percentage: 88, colorClass: "bg-blue-500" },
    { childId: child1.id, label: "Hình học không gian", percentage: 94, colorClass: "bg-orange-500" },
    { childId: child1.id, label: "Đo lường", percentage: 72, colorClass: "bg-green-500" },
    { childId: child1.id, label: "Bảng nhân / chia", percentage: 65, colorClass: "bg-purple-500" },
    { childId: child1.id, label: "Giải toán có lời văn", percentage: 80, colorClass: "bg-pink-500" },
    { childId: child2.id, label: "Số học", percentage: 96, colorClass: "bg-blue-500" },
    { childId: child2.id, label: "Hình học không gian", percentage: 90, colorClass: "bg-orange-500" },
    { childId: child2.id, label: "Đo lường", percentage: 88, colorClass: "bg-green-500" },
    { childId: child2.id, label: "Bảng nhân / chia", percentage: 92, colorClass: "bg-purple-500" },
    { childId: child2.id, label: "Giải toán có lời văn", percentage: 85, colorClass: "bg-pink-500" },
    { childId: child3.id, label: "Nhận dạng số", percentage: 55, colorClass: "bg-blue-500" },
    { childId: child3.id, label: "Đếm số", percentage: 48, colorClass: "bg-orange-500" },
    { childId: child3.id, label: "Hình cơ bản", percentage: 35, colorClass: "bg-green-500" },
    { childId: child3.id, label: "So sánh", percentage: 42, colorClass: "bg-purple-500" },
    { childId: child3.id, label: "Tô màu theo mẫu", percentage: 60, colorClass: "bg-pink-500" },
  ]);
  console.log("  ✅ Skills created");

  // ══════════════════════════════════════════════════════════════
  // 7. RADAR SKILLS
  // ══════════════════════════════════════════════════════════════
  console.log("🕸️ Tạo radar skills...");

  await db.insert(schema.radarSkills).values([
    { childId: child1.id, skill: "Phép cộng", score: 82, fullMark: 100 },
    { childId: child1.id, skill: "Phép trừ", score: 54, fullMark: 100 },
    { childId: child1.id, skill: "Hình học 3D", score: 93, fullMark: 100 },
    { childId: child1.id, skill: "Đo lường", score: 70, fullMark: 100 },
    { childId: child1.id, skill: "Tư duy logic", score: 77, fullMark: 100 },
    { childId: child2.id, skill: "Phép cộng", score: 96, fullMark: 100 },
    { childId: child2.id, skill: "Phép trừ", score: 90, fullMark: 100 },
    { childId: child2.id, skill: "Hình học 3D", score: 88, fullMark: 100 },
    { childId: child2.id, skill: "Đo lường", score: 85, fullMark: 100 },
    { childId: child2.id, skill: "Tư duy logic", score: 97, fullMark: 100 },
    { childId: child3.id, skill: "Nhận dạng số", score: 55, fullMark: 100 },
    { childId: child3.id, skill: "Đếm số", score: 48, fullMark: 100 },
    { childId: child3.id, skill: "Hình cơ bản", score: 35, fullMark: 100 },
    { childId: child3.id, skill: "So sánh", score: 42, fullMark: 100 },
    { childId: child3.id, skill: "Tô màu", score: 60, fullMark: 100 },
  ]);
  console.log("  ✅ Radar skills created");

  // ══════════════════════════════════════════════════════════════
  // 8. ACTIVITIES
  // ══════════════════════════════════════════════════════════════
  console.log("📝 Tạo activities...");

  await db.insert(schema.activities).values([
    // Child 1 — 10 activities
    { childId: child1.id, datetime: "28/02 · 08:15", lesson: "Nhận diện khối Lập phương", subject: "Hình học", duration: "18 ph", score: "95/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "27/02 · 19:40", lesson: "Phép cộng có nhớ", subject: "Số học", duration: "22 ph", score: "80/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "27/02 · 15:10", lesson: "Bảng nhân số 6", subject: "Số học", duration: "10 ph", score: null, status: "Đang dở" },
    { childId: child1.id, datetime: "26/02 · 20:00", lesson: "So sánh các số có 3 chữ số", subject: "Số học", duration: "15 ph", score: "100/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "25/02 · 18:30", lesson: "Đo độ dài – cm và m", subject: "Đo lường", duration: "20 ph", score: "70/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "24/02 · 17:00", lesson: "Góc vuông và góc nhọn", subject: "Hình học", duration: "25 ph", score: "88/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "23/02 · 19:15", lesson: "Phép trừ có nhớ", subject: "Số học", duration: "18 ph", score: null, status: "Đang dở" },
    { childId: child1.id, datetime: "22/02 · 08:00", lesson: "Giải toán: tìm số hạng", subject: "Lời văn", duration: "30 ph", score: "75/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "21/02 · 16:45", lesson: "Đọc giờ đúng – đồng hồ", subject: "Đo lường", duration: "12 ph", score: "90/100", status: "Hoàn thành" },
    { childId: child1.id, datetime: "20/02 · 20:00", lesson: "Bảng nhân số 7", subject: "Số học", duration: "20 ph", score: "82/100", status: "Hoàn thành" },
    // Child 2 — 5 activities
    { childId: child2.id, datetime: "28/02 · 09:00", lesson: "Phép nhân nâng cao", subject: "Số học", duration: "25 ph", score: "98/100", status: "Hoàn thành" },
    { childId: child2.id, datetime: "27/02 · 20:00", lesson: "Tư duy logic: dãy số", subject: "Logic", duration: "30 ph", score: "100/100", status: "Hoàn thành" },
    { childId: child2.id, datetime: "26/02 · 18:15", lesson: "Hình khối 3D nâng cao", subject: "Hình học", duration: "22 ph", score: "92/100", status: "Hoàn thành" },
    { childId: child2.id, datetime: "25/02 · 17:00", lesson: "Giải bài toán lời văn", subject: "Lời văn", duration: "28 ph", score: "88/100", status: "Hoàn thành" },
    { childId: child2.id, datetime: "24/02 · 19:30", lesson: "Đo khối lượng", subject: "Đo lường", duration: "15 ph", score: "95/100", status: "Hoàn thành" },
    // Child 3 — 3 activities
    { childId: child3.id, datetime: "28/02 · 10:00", lesson: "Đếm từ 1 đến 10", subject: "Số học", duration: "8 ph", score: "60/100", status: "Hoàn thành" },
    { childId: child3.id, datetime: "26/02 · 09:30", lesson: "Nhận biết hình tròn", subject: "Hình học", duration: "5 ph", score: null, status: "Đang dở" },
    { childId: child3.id, datetime: "24/02 · 10:15", lesson: "So sánh nhiều ít", subject: "Số học", duration: "10 ph", score: "50/100", status: "Hoàn thành" },
  ]);
  console.log("  ✅ Activities created");

  // ══════════════════════════════════════════════════════════════
  // 9. BILLING
  // ══════════════════════════════════════════════════════════════
  console.log("💰 Tạo billing...");

  await db.insert(schema.billing).values([
    { childId: child1.id, planName: "ViOlympicKids Pro", pricePerMonth: 55000, renewalDate: "01/04/2026", paymentMethod: "Visa ••••4321", cycle: "Hàng tháng", isActive: true },
    { childId: child2.id, planName: "ViOlympicKids VIP", pricePerMonth: 89000, renewalDate: "15/09/2026", paymentMethod: "MoMo ••••8888", cycle: "Hàng năm", isActive: true },
    { childId: child3.id, planName: "Gói Miễn phí", pricePerMonth: 0, renewalDate: "", paymentMethod: "", cycle: "", isActive: true },
  ]);
  console.log("  ✅ Billing created");

  // ══════════════════════════════════════════════════════════════
  // 10. TRANSACTIONS
  // ══════════════════════════════════════════════════════════════
  console.log("🧾 Tạo transactions...");

  await db.insert(schema.transactions).values([
    { parentId: parent1.id, childId: child1.id, date: "01/03/2026", amount: 55000, method: "Visa ••••4321", status: "Thành công" },
    { parentId: parent1.id, childId: child1.id, date: "01/02/2026", amount: 55000, method: "Visa ••••4321", status: "Thành công" },
  ]);
  console.log("  ✅ Transactions created");

  // ══════════════════════════════════════════════════════════════
  // 11. ALERTS
  // ══════════════════════════════════════════════════════════════
  console.log("🔔 Tạo alerts...");

  await db.insert(schema.alerts).values([
    { childId: child1.id, type: "success", title: "Xuất sắc!", message: "Na vừa hoàn thành xuất sắc bài Nhận diện khối Lập phương với điểm 10/10", time: "5 phút trước" },
    { childId: child1.id, type: "warning", title: "Cần chú ý", message: "Bé đang gặp khó khăn ở bài Phép trừ có nhớ. Ba mẹ hãy động viên bé nhé!", time: "2 giờ trước", actionLabel: "Xem chi tiết", actionLink: "/dashboard/progress" },
    { childId: child2.id, type: "success", title: "Siêu sao! ⭐", message: "Bin đạt chuỗi 14 ngày liên tiếp — giữ vững phong độ!", time: "1 giờ trước" },
    { childId: child3.id, type: "warning", title: "Bé học ít quá", message: "Bé Mèo chỉ học 35 phút tuần này. Hãy khuyến khích bé học thêm nhé!", time: "Hôm nay", actionLabel: "Nâng cấp PRO", actionLink: "/dashboard/payment?plan=PRO" },
  ]);
  console.log("  ✅ Alerts created");

  // ══════════════════════════════════════════════════════════════
  // 12. STREAK DAYS (Heatmap data — 28 ngày)
  // ══════════════════════════════════════════════════════════════
  console.log("🔥 Tạo streak days...");

  const child1Streaks = ["01/02","02/02","03/02","04/02","05/02","06/02","07/02","08/02","09/02","10/02","11/02","12/02","13/02","14/02","15/02","16/02","17/02","18/02","19/02","20/02","21/02","22/02","23/02","24/02","25/02","26/02","27/02","28/02"];
  const child1StreakMins = [0,10,35,20,0,45,30,0,12,40,0,25,50,33,18,0,22,45,30,20,0,35,18,25,40,15,22,30];

  await db.insert(schema.streakDaysTable).values(
    child1Streaks.map((d, i) => ({ childId: child1.id, date: d, minutes: child1StreakMins[i] }))
  );
  console.log("  ✅ Streak days created");

  // ══════════════════════════════════════════════════════════════
  // 13. TOPICS + LESSONS (Toán 2 — 14 chủ đề, 75 bài)
  // ══════════════════════════════════════════════════════════════
  console.log("📚 Tạo topics + lessons...");

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

  const createdTopics = await db.insert(schema.topics).values(topicData).returning();
  const topicMap = new Map(createdTopics.map((t) => [t.topicNumber, t.id]));

  // All 75 lessons — [topicNumber, lessonNumber, title, gameType, emoji, description, requiredPlan]
  type LessonTuple = [number, number, string, string | null, string, string, "FREE" | "PRO" | "VIP"];
  const allLessons: LessonTuple[] = [
    // Topic 1
    [1,1,"Bài 1: Ôn tập các số đến 100","number-review-game","🔢","Ôn tập cấu tạo số, đọc, viết và so sánh các số đến 100.","FREE"],
    [1,2,"Tia số. Số liền trước, số liền sau","number-sequence-chart","📊","Tìm quy luật dãy số và điền số còn thiếu trên biểu đồ cột.","FREE"],
    [1,3,"Các thành phần của phép cộng, phép trừ",null,"➕","Nhận biết số hạng, tổng, số bị trừ, số trừ, hiệu.","FREE"],
    [1,4,"Hơn, kém nhau bao nhiêu",null,"⚖️","So sánh hai số và tìm xem hơn/kém nhau bao nhiêu đơn vị.","FREE"],
    [1,5,"Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100","pipe-balance-game","🧮","Luyện tập phép cộng, trừ không nhớ — game nối ống.","FREE"],
    [1,6,"Luyện tập chung","matific-canvas-game","🎮","Game kéo thả số kiểu Matific để tổng hợp kỹ năng chủ đề 1.","FREE"],
    // Topic 2
    [2,7,"Phép cộng (qua 10) trong phạm vi 20","add-across-ten-game","🌟","Tìm hiểu cách cộng qua 10 (VD: 8 + 5 = 13).","FREE"],
    [2,8,"Bảng cộng (qua 10)",null,"📋","Học thuộc bảng cộng qua 10 trong phạm vi 20.","PRO"],
    [2,9,"Bài toán về thêm, bớt một số đơn vị",null,"🎯","Giải bài toán có lời văn dạng thêm, bớt.","PRO"],
    [2,10,"Luyện tập chung",null,"🏋️","Luyện tập tổng hợp phép cộng, trừ qua 10.","PRO"],
    [2,11,"Phép trừ (qua 10) trong phạm vi 20",null,"➖","Tìm hiểu cách trừ qua 10.","PRO"],
    [2,12,"Bảng trừ (qua 10)",null,"📋","Học thuộc bảng trừ qua 10 trong phạm vi 20.","PRO"],
    [2,13,"Bài toán về nhiều hơn, ít hơn một số đơn vị",null,"📝","Giải bài toán có lời văn dạng nhiều hơn, ít hơn.","PRO"],
    [2,14,"Luyện tập chung",null,"🏋️","Tổng hợp các dạng bài tập của chủ đề 2.","PRO"],
    // Topic 3
    [3,15,"Ki-lô-gam",null,"🏷️","Làm quen với đơn vị đo khối lượng kg.","PRO"],
    [3,16,"Lít",null,"🥛","Làm quen với đơn vị đo dung tích lít.","PRO"],
    [3,17,"Thực hành và trải nghiệm với kg, lít",null,"🔬","Thực hành cân, đo.","PRO"],
    [3,18,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 3.","PRO"],
    // Topic 4
    [4,19,"Phép cộng (có nhớ) hai chữ số + một chữ số",null,"🔢","Cộng có nhớ dạng 27 + 5.","PRO"],
    [4,20,"Phép cộng (có nhớ) hai chữ số + hai chữ số",null,"➕","Cộng có nhớ dạng 38 + 25.","PRO"],
    [4,21,"Luyện tập chung",null,"🏋️","Luyện tập phép cộng có nhớ.","PRO"],
    [4,22,"Phép trừ (có nhớ) hai chữ số - một chữ số",null,"➖","Trừ có nhớ dạng 43 − 7.","PRO"],
    [4,23,"Phép trừ (có nhớ) hai chữ số - hai chữ số",null,"➖","Trừ có nhớ dạng 52 − 28.","PRO"],
    [4,24,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 4.","PRO"],
    // Topic 5
    [5,25,"Điểm, đoạn thẳng, đường thẳng, đường cong",null,"📏","Nhận biết hình học cơ bản.","PRO"],
    [5,26,"Đường gấp khúc. Hình tứ giác",null,"🔶","Nhận biết đường gấp khúc và hình tứ giác.","PRO"],
    [5,27,"Thực hành gấp, cắt, ghép, xếp hình",null,"✂️","Thực hành hình học.","PRO"],
    [5,28,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 5.","PRO"],
    // Topic 6
    [6,29,"Ngày – giờ, giờ – phút","time-lab-game","⏰","Đơn vị thời gian.","PRO"],
    [6,30,"Ngày – tháng",null,"📅","Tìm hiểu ngày trong tháng.","PRO"],
    [6,31,"Thực hành xem đồng hồ, xem lịch",null,"🔬","Thực hành thời gian.","PRO"],
    [6,32,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 6.","PRO"],
    // Topic 7
    [7,33,"Ôn tập phép cộng, trừ phạm vi 20, 100",null,"🔢","Ôn lại cộng trừ.","PRO"],
    [7,34,"Ôn tập hình phẳng",null,"📐","Ôn lại hình phẳng.","PRO"],
    [7,35,"Ôn tập đo lường",null,"📏","Ôn lại đo lường.","PRO"],
    [7,36,"Ôn tập chung",null,"🏋️","Tổng hợp ôn tập HK1.","PRO"],
    // Topic 8
    [8,37,"Phép nhân",null,"✖️","Làm quen phép nhân.","PRO"],
    [8,38,"Thừa số, tích",null,"🔢","Nhận biết thừa số và tích.","PRO"],
    [8,39,"Bảng nhân 2",null,"2️⃣","Học thuộc bảng nhân 2.","PRO"],
    [8,40,"Bảng nhân 5",null,"5️⃣","Học thuộc bảng nhân 5.","PRO"],
    [8,41,"Phép chia",null,"➗","Làm quen phép chia.","PRO"],
    [8,42,"Số bị chia, số chia, thương",null,"🔢","Nhận biết thành phần phép chia.","PRO"],
    [8,43,"Bảng chia 2",null,"2️⃣","Học thuộc bảng chia 2.","PRO"],
    [8,44,"Bảng chia 5",null,"5️⃣","Học thuộc bảng chia 5.","PRO"],
    [8,45,"Luyện tập chung",null,"🏋️","Tổng hợp nhân chia.","PRO"],
    // Topic 9
    [9,46,"Mô phỏng 3D: Mở khối trụ, tách khối cầu","math2-quiz-3d","🏀","Không gian 3D tương tác.","FREE"],
    [9,47,"Luyện tập chung",null,"🏋️","Tổng hợp hình khối.","PRO"],
    // Topic 10
    [10,48,"Đơn vị, chục, trăm, nghìn",null,"🔢","Nhận biết hàng.","PRO"],
    [10,49,"Các số tròn trăm, tròn chục",null,"💯","Đọc viết số tròn.","PRO"],
    [10,50,"So sánh các số tròn trăm, tròn chục",null,"⚖️","So sánh số.","PRO"],
    [10,51,"Số có ba chữ số",null,"🔢","Đọc, viết số 3 chữ số.","PRO"],
    [10,52,"Viết số thành tổng trăm, chục, đơn vị",null,"📝","Phân tích số.","PRO"],
    [10,53,"So sánh các số có ba chữ số",null,"⚖️","So sánh.","PRO"],
    [10,54,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 10.","PRO"],
    // Topic 11
    [11,55,"Đề-xi-mét. Mét. Ki-lô-mét",null,"📐","Đơn vị đo độ dài.","PRO"],
    [11,56,"Giới thiệu tiền Việt Nam",null,"💰","Nhận biết tiền VN.","PRO"],
    [11,57,"Thực hành đo độ dài",null,"🔬","Thực hành.","PRO"],
    [11,58,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 11.","PRO"],
    // Topic 12
    [12,59,"Phép cộng (không nhớ) phạm vi 1 000",null,"➕","Cộng không nhớ.","PRO"],
    [12,60,"Phép cộng (có nhớ) phạm vi 1 000",null,"➕","Cộng có nhớ.","PRO"],
    [12,61,"Phép trừ (không nhớ) phạm vi 1 000",null,"➖","Trừ không nhớ.","PRO"],
    [12,62,"Phép trừ (có nhớ) phạm vi 1 000",null,"➖","Trừ có nhớ.","PRO"],
    [12,63,"Luyện tập chung",null,"🏋️","Tổng hợp chủ đề 12.","PRO"],
    // Topic 13
    [13,64,"Thu thập, phân loại, kiểm đếm số liệu",null,"📋","Thu thập số liệu.","PRO"],
    [13,65,"Biểu đồ tranh",null,"🖼️","Đọc và vẽ biểu đồ.","PRO"],
    [13,66,"Chắc chắn, có thể, không thể",null,"🎲","Nhận biết xác suất.","PRO"],
    [13,67,"Thực hành thu thập số liệu",null,"🔬","Thực hành.","PRO"],
    // Topic 14
    [14,68,"Ôn tập số phạm vi 1 000",null,"🔢","Ôn lại số.","PRO"],
    [14,69,"Ôn tập cộng trừ phạm vi 100",null,"➕","Ôn lại cộng trừ.","PRO"],
    [14,70,"Ôn tập cộng trừ phạm vi 1 000",null,"🧮","Ôn lại.","PRO"],
    [14,71,"Ôn tập phép nhân, phép chia",null,"✖️","Ôn lại nhân chia.","PRO"],
    [14,72,"Ôn tập hình học",null,"📐","Ôn lại hình.","PRO"],
    [14,73,"Ôn tập đo lường",null,"📏","Ôn lại đo lường.","PRO"],
    [14,74,"Ôn tập kiểm đếm và xác suất",null,"📊","Ôn lại thống kê.","PRO"],
    [14,75,"Ôn tập chung",null,"🏋️","Tổng hợp ôn tập cả năm.","PRO"],
  ];

  const lessonValues = allLessons.map(([tn, ln, title, gt, emoji, desc, plan]) => ({
    topicId: topicMap.get(tn)!,
    lessonNumber: ln,
    title,
    gameType: gt,
    emoji,
    description: desc,
    requiredPlan: plan,
  }));

  const createdLessons = await db.insert(schema.lessons).values(lessonValues).returning();
  const lessonMap = new Map(createdLessons.map((l) => [l.lessonNumber, l.id]));

  console.log(`  ✅ ${createdTopics.length} topics + ${createdLessons.length} lessons created`);

  // ══════════════════════════════════════════════════════════════
  // 14. QUIZ QUESTIONS
  // ══════════════════════════════════════════════════════════════
  console.log("❓ Tạo quiz questions...");

  const lesson1Id = lessonMap.get(1)!;
  const lesson2Id = lessonMap.get(2)!;
  const lesson46Id = lessonMap.get(46)!;

  // MATH2_B1_QUIZ — 5 câu
  await db.insert(schema.quizQuestions).values([
    { lessonId: lesson1Id, questionNumber: 1, question: "Số gồm 5 chục và 8 đơn vị là số nào?", options: ["85","58","508","50"], correctIndex: 1, explanation: "Số gồm 5 chục và 8 đơn vị được viết là 58." },
    { lessonId: lesson1Id, questionNumber: 2, question: "Số lớn nhất có hai chữ số là số nào?", options: ["10","90","99","100"], correctIndex: 2, explanation: "Trong các số có 2 chữ số (từ 10 đến 99), thì 99 là số lớn nhất." },
    { lessonId: lesson1Id, questionNumber: 3, question: "Số nào điền vào tia số: 10, 20, 30, ▢, 50?", visual: "10 → 20 → 30 → ▢ → 50", options: ["35","40","45","100"], correctIndex: 1, explanation: "Đây là các số tròn chục tăng dần." },
    { lessonId: lesson1Id, questionNumber: 4, question: "Số liền trước của số 60 là số nào?", options: ["61","59","50","60"], correctIndex: 1, explanation: "Số liền trước của 60 là 60 - 1 = 59." },
    { lessonId: lesson1Id, questionNumber: 5, question: "Số 73 đọc là gì?", options: ["Bảy ba","Bảy mươi","Bảy mươi ba","Ba mươi bảy"], correctIndex: 2, explanation: "Số 73 đọc là bảy mươi ba." },
  ]);

  // MATH2_B2_QUIZ — 10 câu
  await db.insert(schema.quizQuestions).values([
    { lessonId: lesson2Id, questionNumber: 1, question: "Số liền trước của 15 là số nào?", options: ["13","14","16","17"], correctIndex: 1, explanation: "Số liền trước của 15 là 14." },
    { lessonId: lesson2Id, questionNumber: 2, question: "Số liền sau của 29 là số nào?", options: ["28","31","30","27"], correctIndex: 2, explanation: "Số liền sau của 29 là 30." },
    { lessonId: lesson2Id, questionNumber: 3, question: "Điền số thiếu vào dãy: 10, 11, ▢, 13, 14", visual: "10 → 11 → ▢ → 13 → 14", options: ["9","12","15","10"], correctIndex: 1, explanation: "Dãy số tăng dần 1 đơn vị, số thiếu là 12." },
    { lessonId: lesson2Id, questionNumber: 4, question: "Trên tia số, số nào đứng liền trước số 50?", visual: "... → ▢ → 50 → 51 → ...", options: ["48","51","49","45"], correctIndex: 2, explanation: "Số liền trước của 50 là 49." },
    { lessonId: lesson2Id, questionNumber: 5, question: "Số liền sau của 99 là số nào?", options: ["98","100","101","90"], correctIndex: 1, explanation: "Số liền sau của 99 là 100." },
    { lessonId: lesson2Id, questionNumber: 6, question: "Số 23 nằm giữa hai số nào trên tia số?", visual: "... → ▢ → 23 → ▢ → ...", options: ["21 và 25","22 và 24","20 và 26","23 và 25"], correctIndex: 1, explanation: "Số 23 nằm giữa 22 và 24." },
    { lessonId: lesson2Id, questionNumber: 7, question: "Điền số thiếu: 5, 10, 15, ▢, 25", visual: "5 → 10 → 15 → ▢ → 25", options: ["18","22","20","16"], correctIndex: 2, explanation: "Dãy số tăng dần 5 đơn vị." },
    { lessonId: lesson2Id, questionNumber: 8, question: "Dãy số nào được sắp xếp từ bé đến lớn?", options: ["32, 31, 33, 34","45, 46, 47, 48","28, 30, 29, 31","50, 48, 49, 51"], correctIndex: 1, explanation: "Dãy 45, 46, 47, 48 tăng dần." },
    { lessonId: lesson2Id, questionNumber: 9, question: "Số liền trước của số liền sau số 70 là số nào?", options: ["69","70","71","72"], correctIndex: 1, explanation: "Số liền sau 70 là 71. Số liền trước 71 là 70." },
    { lessonId: lesson2Id, questionNumber: 10, question: "Điền số thiếu vào tia số: 2, 4, ▢, 8, 10", visual: "2 → 4 → ▢ → 8 → 10", options: ["5","7","6","3"], correctIndex: 2, explanation: "Dãy số tăng dần 2 đơn vị: 2, 4, 6, 8, 10." },
  ]);

  // MATH2_B46_QUIZ — 8 câu (Khối trụ & Khối cầu)
  await db.insert(schema.quizQuestions).values([
    { lessonId: lesson46Id, questionNumber: 1, question: "Khối trụ có bao nhiêu mặt đáy hình tròn?", options: ["1 mặt","2 mặt","3 mặt","Không có"], correctIndex: 1, explanation: "Khối trụ có 2 mặt đáy hình tròn ở hai đầu." },
    { lessonId: lesson46Id, questionNumber: 2, question: "Khối cầu có bao nhiêu mặt cong?", options: ["1 mặt","2 mặt","3 mặt","4 mặt"], correctIndex: 0, explanation: "Khối cầu chỉ có 1 mặt cong duy nhất, không có cạnh và đỉnh." },
    { lessonId: lesson46Id, questionNumber: 3, question: "Đồ vật nào có dạng khối trụ?", options: ["Quả bóng đá","Lon nước ngọt","Xúc xắc","Hộp quà"], correctIndex: 1, explanation: "Lon nước ngọt có 2 đáy tròn và thân cong — đó là khối trụ." },
    { lessonId: lesson46Id, questionNumber: 4, question: "Đồ vật nào có dạng khối cầu?", options: ["Cuộn giấy vệ sinh","Cục pin","Quả bóng đá","Cái trống"], correctIndex: 2, explanation: "Quả bóng đá tròn vo, lăn được mọi hướng — đó là khối cầu." },
    { lessonId: lesson46Id, questionNumber: 5, question: "Khi mở khối trụ ra, ta được những hình nào?", options: ["2 hình tròn và 1 hình chữ nhật","1 hình tròn và 2 hình vuông","2 bán cầu","1 hình tam giác"], correctIndex: 0, explanation: "Khối trụ khi trải ra gồm 2 hình tròn (2 đáy) và 1 hình chữ nhật (mặt bên)." },
    { lessonId: lesson46Id, questionNumber: 6, question: "Khi cắt khối cầu làm đôi, ta được gì?", options: ["2 hình tròn","2 bán cầu","1 hình chữ nhật","2 hình vuông"], correctIndex: 1, explanation: "Khối cầu khi cắt đôi ta được 2 bán cầu, mỗi bán cầu có 1 mặt phẳng và 1 mặt cong." },
    { lessonId: lesson46Id, questionNumber: 7, question: "Khối trụ có bao nhiêu mặt bên cong?", options: ["Không có","1 mặt","2 mặt","3 mặt"], correctIndex: 1, explanation: "Khối trụ có 1 mặt bên cong bao quanh thân." },
    { lessonId: lesson46Id, questionNumber: 8, question: "Cuộn giấy vệ sinh thuộc loại hình khối nào?", options: ["Khối cầu","Khối trụ","Khối lập phương","Khối hộp chữ nhật"], correctIndex: 1, explanation: "Cuộn giấy có 2 đáy tròn và thân cong — đó là khối trụ." },
  ]);

  console.log("  ✅ 23 quiz questions created");

  // ══════════════════════════════════════════════════════════════
  console.log("\n🎉🎉🎉 SEED HOÀN TẤT! 🎉🎉🎉");
  console.log("─────────────────────────────");
  console.log(`  👤 ${7} users`);
  console.log(`  👶 10 children`);
  console.log(`  📊 3 dashboard stats`);
  console.log(`  📝 18 activities`);
  console.log(`  🎯 15 skills`);
  console.log(`  🕸️ 15 radar skills`);
  console.log(`  📅 21 study days`);
  console.log(`  📈 21 weekly trends`);
  console.log(`  🔥 28 streak days`);
  console.log(`  💰 3 billing records`);
  console.log(`  🧾 2 transactions`);
  console.log(`  🔔 4 alerts`);
  console.log(`  📚 ${createdTopics.length} topics`);
  console.log(`  📖 ${createdLessons.length} lessons`);
  console.log(`  ❓ 23 quiz questions`);
  console.log("─────────────────────────────");

  await sql.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed thất bại:", e);
  process.exit(1);
});
