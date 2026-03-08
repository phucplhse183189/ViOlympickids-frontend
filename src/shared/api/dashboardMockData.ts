/**
 * ============================================================
 *  MOCK DATA – Parent Dashboard
 *  Replace each exported constant with a real API call later.
 *  e.g.  export const getDashboardStats = () => fetch('/api/dashboard/stats')
 * ============================================================
 */

// ── Shared localStorage keys for child profiles ──────────────
export const CHILD_PROFILES_STORAGE_KEY = "vio_child_profiles";
export const ACTIVE_CHILD_ID_KEY = "vio_active_child_id";

// ── Types ────────────────────────────────────────────────────

export type PlanType = "FREE" | "PRO" | "VIP";

export type ActivityStatus = "Hoàn thành" | "Đang dở" | "Chưa làm";

export interface DashboardStats {
  weeklyMinutes: number;
  weeklyMinutesPctChange: number;
  completedLessons: number;
  completedLessonsLabel: string;
  bestSkill: string;
  overallScore: number;
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
  colorClass: string;
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
  id: string;
  name: string;
  grade: string;
  avatarEmoji: string;
  avatarBg: string;
  plan: PlanType;
  /** Days remaining on current plan, only applies for PRO/VIP */
  planDaysLeft?: number;
}

export interface ParentProfile {
  name: string;
  avatarInitials: string;
  unreadNotifications: number;
}

export interface RadarSkill {
  skill: string;
  diem: number;
  fullMark: number;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
}

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

/** Per-child dashboard data bundle */
export interface ChildDashboardData {
  stats: DashboardStats;
  studyDays: StudyDay[];
  weeklyTrend: WeeklyTrend[];
  skills: SkillData[];
  activities: Activity[];
  radarSkills: RadarSkill[];
  streakDays: HeatmapDay[];
  streakCount: number;
  billing: BillingInfo;
  alerts: SmartAlert[];
}

// ── 3 child profiles with different plans ────────────────────

export const INITIAL_CHILD_PROFILES: ChildProfile[] = [
  {
    id: "child-1",
    name: "Bé Na",
    grade: "Lớp 2",
    avatarEmoji: "👧",
    avatarBg: "#f97316",
    plan: "PRO",
    planDaysLeft: 25,
  },
  {
    id: "child-2",
    name: "Bé Bin",
    grade: "Lớp 2",
    avatarEmoji: "🧒",
    avatarBg: "#8b5cf6",
    plan: "VIP",
    planDaysLeft: 200,
  },
  {
    id: "child-3",
    name: "Bé Mèo",
    grade: "Lớp 2",
    avatarEmoji: "🐱",
    avatarBg: "#3b82f6",
    plan: "FREE",
  },
];

// ── Parent profile ───────────────────────────────────────────

export const MOCK_PARENT_PROFILE: ParentProfile = {
  name: "Nguyễn Phụ Huynh",
  avatarInitials: "PH",
  unreadNotifications: 3,
};

// ── Per-child mock data ──────────────────────────────────────

const CHILD_1_DATA: ChildDashboardData = {
  stats: {
    weeklyMinutes: 100,
    weeklyMinutesPctChange: 15,
    completedLessons: 5,
    completedLessonsLabel: "Tuần này",
    bestSkill: "Phép cộng",
    overallScore: 82,
    streakDays: 7,
  },
  studyDays: [
    { day: "T2", phut: 20 },
    { day: "T3", phut: 35 },
    { day: "T4", phut: 15 },
    { day: "T5", phut: 40 },
    { day: "T6", phut: 30 },
    { day: "T7", phut: 50 },
    { day: "CN", phut: 25 },
  ],
  weeklyTrend: [
    { week: "T1", diem: 72 },
    { week: "T2", diem: 78 },
    { week: "T3", diem: 75 },
    { week: "T4", diem: 82 },
    { week: "T5", diem: 88 },
    { week: "T6", diem: 85 },
    { week: "T7", diem: 91 },
  ],
  skills: [
    { label: "Số học", pct: 88, colorClass: "bg-blue-500" },
    { label: "Hình học không gian", pct: 94, colorClass: "bg-orange-500" },
    { label: "Đo lường", pct: 72, colorClass: "bg-green-500" },
    { label: "Bảng nhân / chia", pct: 65, colorClass: "bg-purple-500" },
    { label: "Giải toán có lời văn", pct: 80, colorClass: "bg-pink-500" },
  ],
  activities: [
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
  ],
  radarSkills: [
    { skill: "Phép cộng", diem: 82, fullMark: 100 },
    { skill: "Phép trừ", diem: 54, fullMark: 100 },
    { skill: "Hình học 3D", diem: 93, fullMark: 100 },
    { skill: "Đo lường", diem: 70, fullMark: 100 },
    { skill: "Tư duy logic", diem: 77, fullMark: 100 },
  ],
  streakDays: [
    { date: "01/02", minutes: 0 },
    { date: "02/02", minutes: 10 },
    { date: "03/02", minutes: 35 },
    { date: "04/02", minutes: 20 },
    { date: "05/02", minutes: 0 },
    { date: "06/02", minutes: 45 },
    { date: "07/02", minutes: 30 },
    { date: "08/02", minutes: 0 },
    { date: "09/02", minutes: 12 },
    { date: "10/02", minutes: 40 },
    { date: "11/02", minutes: 0 },
    { date: "12/02", minutes: 25 },
    { date: "13/02", minutes: 50 },
    { date: "14/02", minutes: 33 },
    { date: "15/02", minutes: 18 },
    { date: "16/02", minutes: 0 },
    { date: "17/02", minutes: 22 },
    { date: "18/02", minutes: 45 },
    { date: "19/02", minutes: 30 },
    { date: "20/02", minutes: 20 },
    { date: "21/02", minutes: 0 },
    { date: "22/02", minutes: 35 },
    { date: "23/02", minutes: 18 },
    { date: "24/02", minutes: 25 },
    { date: "25/02", minutes: 40 },
    { date: "26/02", minutes: 15 },
    { date: "27/02", minutes: 22 },
    { date: "28/02", minutes: 30 },
  ],
  streakCount: 5,
  billing: {
    planName: "ViOlympicKids Pro",
    pricePerMonth: 55000,
    renewalDate: "01/04/2026",
    paymentMethod: "Visa ••••4321",
    cycle: "Hàng tháng",
    isActive: true,
  },
  alerts: [
    {
      id: "alert-001",
      type: "success",
      title: "Xuất sắc!",
      message:
        "Na vừa hoàn thành xuất sắc bài Nhận diện khối Lập phương với điểm 10/10",
      time: "5 phút trước",
    },
    {
      id: "alert-002",
      type: "warning",
      title: "Cần chú ý",
      message:
        "Bé đang gặp khó khăn ở bài Phép trừ có nhớ. Ba mẹ hãy động viên bé nhé!",
      time: "2 giờ trước",
      actionLabel: "Xem chi tiết",
      actionLink: "/dashboard/progress",
    },
  ],
};

const CHILD_2_DATA: ChildDashboardData = {
  stats: {
    weeklyMinutes: 210,
    weeklyMinutesPctChange: 22,
    completedLessons: 28,
    completedLessonsLabel: "Tuần này",
    bestSkill: "Tư duy logic",
    overallScore: 95,
    streakDays: 14,
  },
  studyDays: [
    { day: "T2", phut: 45 },
    { day: "T3", phut: 30 },
    { day: "T4", phut: 25 },
    { day: "T5", phut: 50 },
    { day: "T6", phut: 35 },
    { day: "T7", phut: 15 },
    { day: "CN", phut: 10 },
  ],
  weeklyTrend: [
    { week: "T1", diem: 88 },
    { week: "T2", diem: 90 },
    { week: "T3", diem: 87 },
    { week: "T4", diem: 92 },
    { week: "T5", diem: 94 },
    { week: "T6", diem: 93 },
    { week: "T7", diem: 97 },
  ],
  skills: [
    { label: "Số học", pct: 96, colorClass: "bg-blue-500" },
    { label: "Hình học không gian", pct: 90, colorClass: "bg-orange-500" },
    { label: "Đo lường", pct: 88, colorClass: "bg-green-500" },
    { label: "Bảng nhân / chia", pct: 92, colorClass: "bg-purple-500" },
    { label: "Giải toán có lời văn", pct: 85, colorClass: "bg-pink-500" },
  ],
  activities: [
    {
      id: "act-b01",
      datetime: "28/02 · 09:00",
      lesson: "Phép nhân nâng cao",
      subject: "Số học",
      duration: "25 ph",
      score: "98/100",
      status: "Hoàn thành",
    },
    {
      id: "act-b02",
      datetime: "27/02 · 20:00",
      lesson: "Tư duy logic: dãy số",
      subject: "Logic",
      duration: "30 ph",
      score: "100/100",
      status: "Hoàn thành",
    },
    {
      id: "act-b03",
      datetime: "26/02 · 18:15",
      lesson: "Hình khối 3D nâng cao",
      subject: "Hình học",
      duration: "22 ph",
      score: "92/100",
      status: "Hoàn thành",
    },
    {
      id: "act-b04",
      datetime: "25/02 · 17:00",
      lesson: "Giải bài toán lời văn",
      subject: "Lời văn",
      duration: "28 ph",
      score: "88/100",
      status: "Hoàn thành",
    },
    {
      id: "act-b05",
      datetime: "24/02 · 19:30",
      lesson: "Đo khối lượng",
      subject: "Đo lường",
      duration: "15 ph",
      score: "95/100",
      status: "Hoàn thành",
    },
  ],
  radarSkills: [
    { skill: "Phép cộng", diem: 96, fullMark: 100 },
    { skill: "Phép trừ", diem: 90, fullMark: 100 },
    { skill: "Hình học 3D", diem: 88, fullMark: 100 },
    { skill: "Đo lường", diem: 85, fullMark: 100 },
    { skill: "Tư duy logic", diem: 97, fullMark: 100 },
  ],
  streakDays: [
    { date: "01/02", minutes: 30 },
    { date: "02/02", minutes: 25 },
    { date: "03/02", minutes: 40 },
    { date: "04/02", minutes: 35 },
    { date: "05/02", minutes: 20 },
    { date: "06/02", minutes: 50 },
    { date: "07/02", minutes: 45 },
    { date: "08/02", minutes: 30 },
    { date: "09/02", minutes: 25 },
    { date: "10/02", minutes: 35 },
    { date: "11/02", minutes: 40 },
    { date: "12/02", minutes: 20 },
    { date: "13/02", minutes: 45 },
    { date: "14/02", minutes: 30 },
    { date: "15/02", minutes: 35 },
    { date: "16/02", minutes: 25 },
    { date: "17/02", minutes: 40 },
    { date: "18/02", minutes: 50 },
    { date: "19/02", minutes: 30 },
    { date: "20/02", minutes: 35 },
    { date: "21/02", minutes: 20 },
    { date: "22/02", minutes: 45 },
    { date: "23/02", minutes: 30 },
    { date: "24/02", minutes: 40 },
    { date: "25/02", minutes: 35 },
    { date: "26/02", minutes: 50 },
    { date: "27/02", minutes: 25 },
    { date: "28/02", minutes: 45 },
  ],
  streakCount: 14,
  billing: {
    planName: "ViOlympicKids VIP",
    pricePerMonth: 89000,
    renewalDate: "15/09/2026",
    paymentMethod: "MoMo ••••8888",
    cycle: "Hàng năm",
    isActive: true,
  },
  alerts: [
    {
      id: "alert-b01",
      type: "success",
      title: "Siêu sao! ⭐",
      message: "Bin đạt chuỗi 14 ngày liên tiếp — giữ vững phong độ!",
      time: "1 giờ trước",
    },
  ],
};

const CHILD_3_DATA: ChildDashboardData = {
  stats: {
    weeklyMinutes: 35,
    weeklyMinutesPctChange: -5,
    completedLessons: 3,
    completedLessonsLabel: "Tuần này",
    bestSkill: "Nhận dạng số",
    overallScore: 45,
    streakDays: 1,
  },
  studyDays: [
    { day: "T2", phut: 10 },
    { day: "T3", phut: 0 },
    { day: "T4", phut: 5 },
    { day: "T5", phut: 0 },
    { day: "T6", phut: 10 },
    { day: "T7", phut: 10 },
    { day: "CN", phut: 0 },
  ],
  weeklyTrend: [
    { week: "T1", diem: 40 },
    { week: "T2", diem: 42 },
    { week: "T3", diem: 38 },
    { week: "T4", diem: 45 },
    { week: "T5", diem: 43 },
    { week: "T6", diem: 44 },
    { week: "T7", diem: 46 },
  ],
  skills: [
    { label: "Nhận dạng số", pct: 55, colorClass: "bg-blue-500" },
    { label: "Đếm số", pct: 48, colorClass: "bg-orange-500" },
    { label: "Hình cơ bản", pct: 35, colorClass: "bg-green-500" },
    { label: "So sánh", pct: 42, colorClass: "bg-purple-500" },
    { label: "Tô màu theo mẫu", pct: 60, colorClass: "bg-pink-500" },
  ],
  activities: [
    {
      id: "act-c01",
      datetime: "28/02 · 10:00",
      lesson: "Đếm từ 1 đến 10",
      subject: "Số học",
      duration: "8 ph",
      score: "60/100",
      status: "Hoàn thành",
    },
    {
      id: "act-c02",
      datetime: "26/02 · 09:30",
      lesson: "Nhận biết hình tròn",
      subject: "Hình học",
      duration: "5 ph",
      score: null,
      status: "Đang dở",
    },
    {
      id: "act-c03",
      datetime: "24/02 · 10:15",
      lesson: "So sánh nhiều ít",
      subject: "Số học",
      duration: "10 ph",
      score: "50/100",
      status: "Hoàn thành",
    },
  ],
  radarSkills: [
    { skill: "Nhận dạng số", diem: 55, fullMark: 100 },
    { skill: "Đếm số", diem: 48, fullMark: 100 },
    { skill: "Hình cơ bản", diem: 35, fullMark: 100 },
    { skill: "So sánh", diem: 42, fullMark: 100 },
    { skill: "Tô màu", diem: 60, fullMark: 100 },
  ],
  streakDays: [
    { date: "01/02", minutes: 0 },
    { date: "02/02", minutes: 0 },
    { date: "03/02", minutes: 5 },
    { date: "04/02", minutes: 0 },
    { date: "05/02", minutes: 0 },
    { date: "06/02", minutes: 10 },
    { date: "07/02", minutes: 0 },
    { date: "08/02", minutes: 0 },
    { date: "09/02", minutes: 0 },
    { date: "10/02", minutes: 8 },
    { date: "11/02", minutes: 0 },
    { date: "12/02", minutes: 0 },
    { date: "13/02", minutes: 5 },
    { date: "14/02", minutes: 0 },
    { date: "15/02", minutes: 0 },
    { date: "16/02", minutes: 0 },
    { date: "17/02", minutes: 10 },
    { date: "18/02", minutes: 0 },
    { date: "19/02", minutes: 0 },
    { date: "20/02", minutes: 5 },
    { date: "21/02", minutes: 0 },
    { date: "22/02", minutes: 0 },
    { date: "23/02", minutes: 0 },
    { date: "24/02", minutes: 10 },
    { date: "25/02", minutes: 0 },
    { date: "26/02", minutes: 5 },
    { date: "27/02", minutes: 0 },
    { date: "28/02", minutes: 10 },
  ],
  streakCount: 1,
  billing: {
    planName: "Gói Miễn phí",
    pricePerMonth: 0,
    renewalDate: "",
    paymentMethod: "",
    cycle: "",
    isActive: true,
  },
  alerts: [
    {
      id: "alert-c01",
      type: "warning",
      title: "Bé học ít quá",
      message:
        "Bé Mèo chỉ học 35 phút tuần này. Hãy khuyến khích bé học thêm nhé!",
      time: "Hôm nay",
      actionLabel: "Nâng cấp PRO",
      actionLink: "/dashboard/payment?plan=PRO",
    },
  ],
};

/** Get dashboard data for a child by ID */
export function getChildDashboard(childId: string): ChildDashboardData {
  const map: Record<string, ChildDashboardData> = {
    "child-1": CHILD_1_DATA,
    "child-2": CHILD_2_DATA,
    "child-3": CHILD_3_DATA,
  };
  const base = map[childId] ?? CHILD_1_DATA;

  // Reflect current plan from localStorage into billing
  const profiles = loadChildProfiles();
  const profile = profiles.find((p) => p.id === childId);
  if (profile) {
    const planLabel =
      profile.plan === "VIP"
        ? "ViOlympicKids VIP"
        : profile.plan === "PRO"
          ? "ViOlympicKids Pro"
          : "Gói Miễn phí";
    return {
      ...base,
      billing: {
        ...base.billing,
        planName: planLabel,
        pricePerMonth:
          profile.plan === "VIP" ? 89000 : profile.plan === "PRO" ? 55000 : 0,
        isActive: true,
      },
    };
  }
  return base;
}

/** Update a child's plan in localStorage */
export function updateChildPlan(
  childId: string,
  plan: PlanType,
  daysLeft?: number,
): void {
  const profiles = loadChildProfiles();
  const updated = profiles.map((p) =>
    p.id === childId
      ? {
          ...p,
          plan,
          planDaysLeft: daysLeft ?? (plan === "FREE" ? undefined : 30),
        }
      : p,
  );
  localStorage.setItem(CHILD_PROFILES_STORAGE_KEY, JSON.stringify(updated));
}

const TRANSACTIONS_STORAGE_KEY = "vio_transactions";

/** Add a payment transaction to localStorage */
export function addTransaction(tx: PaymentTransaction): void {
  const existing = getTransactions();
  localStorage.setItem(
    TRANSACTIONS_STORAGE_KEY,
    JSON.stringify([tx, ...existing]),
  );
}

/** Get all transactions from localStorage */
export function getTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PaymentTransaction[];
  } catch {
    /* ignore */
  }
  return MOCK_TRANSACTIONS;
}

/** Load profiles from localStorage or use initial profiles */
export function loadChildProfiles(): ChildProfile[] {
  try {
    const raw = localStorage.getItem(CHILD_PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChildProfile[];
      // Discard stale cache that lacks the `plan` field
      if (parsed.length > 0 && parsed[0].plan) return parsed;
      localStorage.removeItem(CHILD_PROFILES_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  return INITIAL_CHILD_PROFILES;
}

/** Get active child ID from localStorage */
export function getActiveChildId(): string {
  const profiles = loadChildProfiles();
  const saved = localStorage.getItem(ACTIVE_CHILD_ID_KEY);
  const exists = profiles.find((p) => p.id === saved);
  return exists ? saved! : profiles[0].id;
}

// ── Legacy exports for backward compat ───────────────────────

export const SUBJECT_FILTER_OPTIONS = [
  "Tất cả",
  "Số học",
  "Hình học",
  "Đo lường",
  "Lời văn",
  "Logic",
];

export const FREE_PLAN_FEATURES = [
  "Truy cập 10 bài học miễn phí",
  "1 tài khoản học sinh",
  "Tiến độ cơ bản",
];

export const PRO_PLAN_FEATURES = [
  "Toàn bộ 200+ bài học 3D",
  "Báo cáo cơ bản hàng ngày",
  "Không giới hạn bài tập",
  "Hỗ trợ qua email",
  "Cập nhật nội dung mới mỗi tuần",
];

export const VIP_PLAN_FEATURES = [
  "Tất cả tính năng PRO",
  "AI Hướng dẫn giọng nói",
  "Phân tích AI điểm mạnh/yếu chi tiết",
  "Không giới hạn bài tập",
  "Ưu tiên hỗ trợ 24/7",
  "Lộ trình học cá nhân hóa",
];

export const MOCK_TRIAL: TrialInfo = {
  totalDays: 7,
  usedDays: 5,
};

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "TXN-20260301",
    date: "01/03/2026",
    amount: 55000,
    method: "Visa ••••4321",
    status: "Thành công",
  },
  {
    id: "TXN-20260201",
    date: "01/02/2026",
    amount: 55000,
    method: "Visa ••••4321",
    status: "Thành công",
  },
];
