import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["parent", "admin"]);
export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "inactive",
  "suspended",
]);
export const planEnum = pgEnum("plan_type", ["FREE", "PRO", "VIP"]);
export const genderEnum = pgEnum("gender", ["boy", "girl"]);
export const activityStatusEnum = pgEnum("activity_status", [
  "Hoàn thành",
  "Đang dở",
  "Chưa làm",
]);
export const txStatusEnum = pgEnum("tx_status", ["Thành công", "Thất bại"]);
export const alertTypeEnum = pgEnum("alert_type", ["success", "warning"]);

// ── Bảng: users (Phụ huynh + Admin) ─────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 200 }),
  avatarInitials: varchar("avatar_initials", { length: 10 }),
  avatarId: varchar("avatar_id", { length: 50 }),
  role: roleEnum("role").default("parent").notNull(),
  status: accountStatusEnum("status").default("active").notNull(),
  unreadNotifications: integer("unread_notifications").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Bảng: children (Hồ sơ bé) ───────────────────────────────────────────────
export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 20 }).notNull(),
  avatarEmoji: varchar("avatar_emoji", { length: 10 }).notNull(),
  avatarBg: varchar("avatar_bg", { length: 20 }),
  plan: planEnum("plan").default("FREE").notNull(),
  planDaysLeft: integer("plan_days_left"),
  gender: genderEnum("gender"),
  status: accountStatusEnum("status").default("active").notNull(),
  totalLessons: integer("total_lessons").default(0),
  avgScore: integer("avg_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active"),
});

// ── Bảng: dashboard_stats ────────────────────────────────────────────────────
export const dashboardStats = pgTable("dashboard_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  weeklyMinutes: integer("weekly_minutes").default(0),
  weeklyMinutesPctChange: integer("weekly_minutes_pct_change").default(0),
  completedLessons: integer("completed_lessons").default(0),
  completedLessonsLabel: varchar("completed_lessons_label", { length: 50 }),
  bestSkill: varchar("best_skill", { length: 100 }),
  overallScore: integer("overall_score").default(0),
  streakDays: integer("streak_days").default(0),
  weekOf: date("week_of").defaultNow(),
});

// ── Bảng: activities (Lịch sử hoạt động) ────────────────────────────────────
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  datetime: varchar("datetime", { length: 50 }).notNull(),
  lesson: varchar("lesson", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 20 }),
  score: varchar("score", { length: 20 }),
  status: activityStatusEnum("status").default("Chưa làm").notNull(),
});

// ── Bảng: skills (Kỹ năng — progress bars) ──────────────────────────────────
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  percentage: integer("percentage").default(0),
  colorClass: varchar("color_class", { length: 50 }),
});

// ── Bảng: radar_skills (Radar chart data) ────────────────────────────────────
export const radarSkills = pgTable("radar_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  skill: varchar("skill", { length: 100 }).notNull(),
  score: integer("score").default(0),
  fullMark: integer("full_mark").default(100),
});

// ── Bảng: study_days (Số phút học mỗi ngày trong tuần) ──────────────────────
export const studyDays = pgTable("study_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  day: varchar("day", { length: 10 }).notNull(),
  minutes: integer("minutes").default(0),
  weekOf: date("week_of").defaultNow(),
});

// ── Bảng: weekly_trends (Điểm theo tuần) ────────────────────────────────────
export const weeklyTrends = pgTable("weekly_trends", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  week: varchar("week", { length: 10 }).notNull(),
  score: integer("score").default(0),
});

// ── Bảng: streak_days (Heatmap — số phút mỗi ngày) ──────────────────────────
export const streakDaysTable = pgTable("streak_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  minutes: integer("minutes").default(0),
});

// ── Bảng: billing ────────────────────────────────────────────────────────────
export const billing = pgTable("billing", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  planName: varchar("plan_name", { length: 100 }),
  pricePerMonth: integer("price_per_month").default(0),
  renewalDate: varchar("renewal_date", { length: 20 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  cycle: varchar("cycle", { length: 50 }),
  isActive: boolean("is_active").default(true),
});

// ── Bảng: transactions (Lịch sử giao dịch) ──────────────────────────────────
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .references(() => users.id)
    .notNull(),
  childId: uuid("child_id").references(() => children.id),
  date: varchar("date", { length: 20 }).notNull(),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 100 }).notNull(),
  status: txStatusEnum("status").default("Thành công").notNull(),
});

// ── Bảng: alerts ─────────────────────────────────────────────────────────────
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  type: alertTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  time: varchar("time", { length: 50 }),
  actionLabel: varchar("action_label", { length: 100 }),
  actionLink: varchar("action_link", { length: 200 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Bảng: topics (Chủ đề Toán 2) ────────────────────────────────────────────
export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicNumber: integer("topic_number").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  color: varchar("color", { length: 100 }),
  accent: varchar("accent", { length: 100 }),
  emoji: varchar("emoji", { length: 10 }),
});

// ── Bảng: lessons (Bài học) ──────────────────────────────────────────────────
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .references(() => topics.id)
    .notNull(),
  lessonNumber: integer("lesson_number").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  gameType: varchar("game_type", { length: 50 }),
  emoji: varchar("emoji", { length: 10 }),
  description: text("description"),
  requiredPlan: planEnum("required_plan").default("FREE").notNull(),
});

// ── Bảng: quiz_questions ─────────────────────────────────────────────────────
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id)
    .notNull(),
  questionNumber: integer("question_number").notNull(),
  question: text("question").notNull(),
  visual: varchar("visual", { length: 200 }),
  options: jsonb("options").notNull(), // ["A", "B", "C", "D"]
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
});

// ── Bảng: completed_lessons ──────────────────────────────────────────────────
export const completedLessons = pgTable("completed_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .references(() => children.id)
    .notNull(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id)
    .notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
