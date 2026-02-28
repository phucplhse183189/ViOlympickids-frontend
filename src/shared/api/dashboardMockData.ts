/**
 * ============================================================
 *  MOCK DATA – Parent Dashboard
 *  Replace each exported constant with a real API call later.
 *  e.g.  export const getDashboardStats = () => fetch('/api/dashboard/stats')
 * ============================================================
 */

// ── Types ────────────────────────────────────────────────────

export type ActivityStatus = "Hoàn thành" | "Đang dở" | "Chưa làm";

export interface DashboardStats {
  weeklyMinutes: number;
  weeklyMinutesPctChange: number; // e.g. +15 means +15%
  completedLessons: number;
  completedLessonsLabel: string;
  bestSkill: string;
  overallScore: number; // 0-100
  streakDays: number;
}

export interface StudyDay {
  day: string;
  phut: number;
}

export interface Activity {
  id: string;
  datetime: string;
  lesson: string;
  subject: string;
  duration: string;
  score: string | null;
  status: ActivityStatus;
}

export interface SkillData {
  label: string;
  pct: number;
  colorClass: string; // Tailwind class e.g. "bg-blue-500"
}

export interface WeeklyTrend {
  week: string;
  diem: number;
}

export interface BillingInfo {
  planName: string;
  pricePerMonth: number;
  renewalDate: string;
  paymentMethod: string;
  cycle: string;
  isActive: boolean;
}

export interface ChildProfile {
  name: string;
  grade: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface ParentProfile {
  name: string;
  avatarInitials: string;
  unreadNotifications: number;
}

// ── Mock data ────────────────────────────────────────────────

export const MOCK_PARENT_PROFILE: ParentProfile = {
  name: "Nguyễn Phụ Huynh",
  avatarInitials: "PH",
  unreadNotifications: 3,
};

export const MOCK_CHILD_PROFILE: ChildProfile = {
  name: "Nguyễn Bé Yêu",
  grade: "Lớp 3",
  avatarInitials: "BY",
  avatarColor: "#f97316",
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  weeklyMinutes: 120,
  weeklyMinutesPctChange: 15,
  completedLessons: 15,
  completedLessonsLabel: "Tuần này",
  bestSkill: "Hình học không gian",
  overallScore: 82,
  streakDays: 7,
};

export const MOCK_STUDY_DAYS: StudyDay[] = [
  { day: "T2", phut: 20 },
  { day: "T3", phut: 35 },
  { day: "T4", phut: 15 },
  { day: "T5", phut: 40 },
  { day: "T6", phut: 30 },
  { day: "T7", phut: 50 },
  { day: "CN", phut: 25 },
];

export const MOCK_WEEKLY_TREND: WeeklyTrend[] = [
  { week: "T1", diem: 72 },
  { week: "T2", diem: 78 },
  { week: "T3", diem: 75 },
  { week: "T4", diem: 82 },
  { week: "T5", diem: 88 },
  { week: "T6", diem: 85 },
  { week: "T7", diem: 91 },
];

export const MOCK_SKILLS: SkillData[] = [
  { label: "Số học", pct: 88, colorClass: "bg-blue-500" },
  { label: "Hình học không gian", pct: 94, colorClass: "bg-orange-500" },
  { label: "Đo lường", pct: 72, colorClass: "bg-green-500" },
  { label: "Bảng nhân / chia", pct: 65, colorClass: "bg-purple-500" },
  { label: "Giải toán có lời văn", pct: 80, colorClass: "bg-pink-500" },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "act-001",
    datetime: "28/02 · 08:15",
    lesson: "Nhận diện khối Lập phương",
    subject: "Hình học",
    duration: "18 ph",
    score: "95/100",
    status: "Hoàn thành",
  },
  {
    id: "act-002",
    datetime: "27/02 · 19:40",
    lesson: "Phép cộng có nhớ",
    subject: "Số học",
    duration: "22 ph",
    score: "80/100",
    status: "Hoàn thành",
  },
  {
    id: "act-003",
    datetime: "27/02 · 15:10",
    lesson: "Bảng nhân số 6",
    subject: "Số học",
    duration: "10 ph",
    score: null,
    status: "Đang dở",
  },
  {
    id: "act-004",
    datetime: "26/02 · 20:00",
    lesson: "So sánh các số có 3 chữ số",
    subject: "Số học",
    duration: "15 ph",
    score: "100/100",
    status: "Hoàn thành",
  },
  {
    id: "act-005",
    datetime: "25/02 · 18:30",
    lesson: "Đo độ dài – cm và m",
    subject: "Đo lường",
    duration: "20 ph",
    score: "70/100",
    status: "Hoàn thành",
  },
  {
    id: "act-006",
    datetime: "24/02 · 17:00",
    lesson: "Góc vuông và góc nhọn",
    subject: "Hình học",
    duration: "25 ph",
    score: "88/100",
    status: "Hoàn thành",
  },
  {
    id: "act-007",
    datetime: "23/02 · 19:15",
    lesson: "Phép trừ có nhớ",
    subject: "Số học",
    duration: "18 ph",
    score: null,
    status: "Đang dở",
  },
  {
    id: "act-008",
    datetime: "22/02 · 08:00",
    lesson: "Giải toán: tìm số hạng",
    subject: "Lời văn",
    duration: "30 ph",
    score: "75/100",
    status: "Hoàn thành",
  },
  {
    id: "act-009",
    datetime: "21/02 · 16:45",
    lesson: "Đọc giờ đúng – đồng hồ",
    subject: "Đo lường",
    duration: "12 ph",
    score: "90/100",
    status: "Hoàn thành",
  },
  {
    id: "act-010",
    datetime: "20/02 · 20:00",
    lesson: "Bảng nhân số 7",
    subject: "Số học",
    duration: "20 ph",
    score: "82/100",
    status: "Hoàn thành",
  },
];

export const MOCK_BILLING: BillingInfo = {
  planName: "ViOlympicKids Pro",
  pricePerMonth: 59000,
  renewalDate: "01/04/2026",
  paymentMethod: "Visa ••••4321",
  cycle: "Hàng tháng",
  isActive: true,
};

export const FREE_PLAN_FEATURES = [
  "Truy cập 10 bài học miễn phí",
  "1 tài khoản học sinh",
  "Tiến độ cơ bản",
];

export const PRO_PLAN_FEATURES = [
  "Toàn bộ 200+ bài học 3D",
  "AI Hướng dẫn giọng nói",
  "Báo cáo chi tiết hàng ngày",
  "Không giới hạn bài tập",
  "Ưu tiên hỗ trợ 24/7",
  "Cập nhật nội dung mới mỗi tuần",
];

export const SUBJECT_FILTER_OPTIONS = [
  "Tất cả",
  "Số học",
  "Hình học",
  "Đo lường",
  "Lời văn",
];

// ── SkillRadarChart mock data ─────────────────────────────────

export interface RadarSkill {
  skill: string;
  diem: number;
  fullMark: number;
}

export const MOCK_RADAR_SKILLS: RadarSkill[] = [
  { skill: "Phép cộng", diem: 82, fullMark: 100 },
  { skill: "Phép trừ", diem: 54, fullMark: 100 },
  { skill: "Hình học 3D", diem: 93, fullMark: 100 },
  { skill: "Đo lường", diem: 70, fullMark: 100 },
  { skill: "Tư duy logic", diem: 77, fullMark: 100 },
];

// ── StreakHeatmap mock data ───────────────────────────────────
// 28 days from Feb 1 → Feb 28, 2026 (4 full weeks)
// minutes: 0 = không học, 1-14 = < 15 phút, ≥ 15 = học tốt (15-29), ≥ 30 = học đạt

export interface HeatmapDay {
  date: string; // "DD/MM"
  minutes: number;
}

export const MOCK_STREAK_DAYS: HeatmapDay[] = [
  // Week 1: Feb 1-7
  { date: "01/02", minutes: 0 },
  { date: "02/02", minutes: 10 },
  { date: "03/02", minutes: 35 },
  { date: "04/02", minutes: 20 },
  { date: "05/02", minutes: 0 },
  { date: "06/02", minutes: 45 },
  { date: "07/02", minutes: 30 },
  // Week 2: Feb 8-14
  { date: "08/02", minutes: 0 },
  { date: "09/02", minutes: 12 },
  { date: "10/02", minutes: 40 },
  { date: "11/02", minutes: 0 },
  { date: "12/02", minutes: 25 },
  { date: "13/02", minutes: 50 },
  { date: "14/02", minutes: 33 },
  // Week 3: Feb 15-21
  { date: "15/02", minutes: 18 },
  { date: "16/02", minutes: 0 },
  { date: "17/02", minutes: 22 },
  { date: "18/02", minutes: 45 },
  { date: "19/02", minutes: 30 },
  { date: "20/02", minutes: 20 },
  { date: "21/02", minutes: 0 },
  // Week 4: Feb 22-28
  { date: "22/02", minutes: 35 },
  { date: "23/02", minutes: 18 },
  { date: "24/02", minutes: 25 },
  { date: "25/02", minutes: 40 },
  { date: "26/02", minutes: 15 },
  { date: "27/02", minutes: 22 },
  { date: "28/02", minutes: 30 },
];

export const MOCK_STREAK_COUNT = 5; // days in current streak

// ── Shared localStorage keys for child profiles ──────────────
export const CHILD_PROFILES_STORAGE_KEY = "vio_child_profiles";
export const ACTIVE_CHILD_ID_KEY = "vio_active_child_id";

// ── BillingManagement mock data ──────────────────────────────

export interface TrialInfo {
  totalDays: number;
  usedDays: number;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "Thành công" | "Thất bại";
}

export const MOCK_TRIAL: TrialInfo = {
  totalDays: 7,
  usedDays: 5, // → còn 2 ngày
};

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "TXN-20260101",
    date: "01/01/2026",
    amount: 59000,
    method: "Visa ••••4321",
    status: "Thành công",
  },
  {
    id: "TXN-20251201",
    date: "01/12/2025",
    amount: 59000,
    method: "Visa ••••4321",
    status: "Thất bại",
  },
];

// ── SmartAlerts mock data ────────────────────────────────────

export type AlertType = "success" | "warning";

export interface SmartAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  actionLabel?: string;
  actionLink?: string;
}

export const MOCK_ALERTS: SmartAlert[] = [
  {
    id: "alert-001",
    type: "success",
    title: "Xuất sắc!",
    message:
      "Tom vừa hoàn thành xuất sắc bài Nhận diện khối Lập phương với điểm 10/10",
    time: "5 phút trước",
  },
  {
    id: "alert-002",
    type: "warning",
    title: "Cần chú ý",
    message:
      "Bé đang gặp một chút khó khăn ở bài Phép trừ có nhớ. Ba mẹ hãy động viên bé nhé!",
    time: "2 giờ trước",
    actionLabel: "Xem chi tiết bài thi",
    actionLink: "#",
  },
];
