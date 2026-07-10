import { apiGet, apiPost, apiPut } from "@/shared/api/client";

/** Hồ sơ bé */
export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  grade: string;
  avatarEmoji: string;
  avatarBg: string | null;
  plan: "FREE" | "PRO" | "VIP";
  planDaysLeft: number | null;
  gender: "boy" | "girl" | null;
  status: "active" | "inactive" | "suspended";
  totalLessons: number | null;
  avgScore: number | null;
  createdAt: string;
  lastActive: string | null;
}

/** Dữ liệu dashboard tổng hợp */
export interface DashboardData {
  stats: {
    id: string;
    childId: string;
    weeklyMinutes: number | null;
    weeklyMinutesPctChange: number | null;
    completedLessons: number | null;
    completedLessonsLabel: string | null;
    bestSkill: string | null;
    overallScore: number | null;
    streakDays: number | null;
    weekOf: string | null;
  } | null;
  studyDays: Array<{
    id: string;
    childId: string;
    day: string;
    minutes: number | null;
    weekOf: string | null;
  }>;
  weeklyTrends: Array<{
    id: string;
    childId: string;
    week: string;
    score: number | null;
  }>;
  skills: Array<{
    id: string;
    childId: string;
    label: string;
    percentage: number | null;
    colorClass: string | null;
  }>;
  activities: Array<{
    id: string;
    childId: string;
    datetime: string;
    lesson: string;
    subject: string;
    duration: string | null;
    score: string | null;
    status: "Hoàn thành" | "Đang dở" | "Chưa làm";
  }>;
  radarSkills: Array<{
    id: string;
    childId: string;
    skill: string;
    score: number | null;
    fullMark: number | null;
  }>;
  streakDays: Array<{
    id: string;
    childId: string;
    date: string;
    minutes: number | null;
  }>;
  billing: {
    id: string;
    childId: string;
    planName: string | null;
    pricePerMonth: number | null;
    renewalDate: string | null;
    paymentMethod: string | null;
    cycle: string | null;
    isActive: boolean | null;
  } | null;
  alerts: Array<{
    id: string;
    childId: string;
    type: "success" | "warning";
    title: string;
    message: string;
    time: string | null;
    actionLabel: string | null;
    actionLink: string | null;
    isRead: boolean | null;
    createdAt: string;
  }>;
}

/**
 * Lấy danh sách hồ sơ bé của phụ huynh
 */
export async function getProfiles(parentId: string): Promise<ChildProfile[]> {
  return apiGet<ChildProfile[]>(`/children?parentId=${parentId}`);
}

/**
 * Lấy toàn bộ dữ liệu dashboard của bé
 */
export async function getDashboard(childId: string): Promise<DashboardData> {
  return apiGet<DashboardData>(`/children/${childId}/dashboard`);
}

/**
 * Cập nhật gói dịch vụ của bé
 */
export async function updatePlan(
  childId: string,
  plan: "FREE" | "PRO" | "VIP",
  daysLeft?: number
): Promise<ChildProfile> {
  return apiPut<ChildProfile>(`/children/${childId}/plan`, { plan, daysLeft });
}

/**
 * Thêm hồ sơ bé mới
 */
export async function addChild(
  parentId: string,
  data: {
    name: string;
    grade: string;
    avatarEmoji: string;
    avatarBg?: string;
    plan?: "FREE" | "PRO" | "VIP";
    gender?: "boy" | "girl";
  }
): Promise<ChildProfile> {
  return apiPost<ChildProfile>("/children/add", { parentId, ...data });
}
