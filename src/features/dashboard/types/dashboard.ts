/**
 * ============================================================
 *  Types – Parent Dashboard
 *  Các kiểu dữ liệu dashboard phụ huynh: hồ sơ con, thống kê,
 *  hoạt động, kỹ năng, chuỗi ngày học, cảnh báo thông minh, v.v.
 * ============================================================
 */

import type { BillingInfo } from "./payment";

// ── Gói dịch vụ ──────────────────────────────────────────────

export type PlanType = "FREE" | "PRO" | "VIP";

// ── Trạng thái hoạt động ─────────────────────────────────────

export type ActivityStatus = "Hoàn thành" | "Đang dở" | "Chưa làm";

// ── Thống kê dashboard ───────────────────────────────────────

export interface DashboardStats {
  weeklyMinutes: number;
  weeklyMinutesPctChange: number;
  completedLessons: number;
  completedLessonsLabel: string;
  bestSkill: string;
  overallScore: number;
  streakDays: number;
}

// ── Ngày học trong tuần ──────────────────────────────────────

export interface StudyDay {
  day: string;
  phut: number;
}

// ── Hoạt động gần đây ───────────────────────────────────────

export interface Activity {
  id: string;
  datetime: string;
  lesson: string;
  subject: string;
  duration: string;
  score: string | null;
  status: ActivityStatus;
}

// ── Dữ liệu kỹ năng (thanh tiến trình) ──────────────────────

export interface SkillData {
  label: string;
  pct: number;
  colorClass: string;
}

// ── Xu hướng điểm hàng tuần ─────────────────────────────────

export interface WeeklyTrend {
  week: string;
  diem: number;
}

// ── Kỹ năng radar ────────────────────────────────────────────

export interface RadarSkill {
  skill: string;
  diem: number;
  fullMark: number;
}

// ── Ngày heatmap (chuỗi ngày học) ────────────────────────────

export interface HeatmapDay {
  date: string;
  minutes: number;
}

// ── Hồ sơ con ────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatarEmoji: string;
  avatarBg: string;
  plan: PlanType;
  /** Số ngày còn lại của gói hiện tại, chỉ áp dụng cho PRO/VIP */
  planDaysLeft?: number;
}

// ── Hồ sơ phụ huynh ─────────────────────────────────────────

export interface ParentProfile {
  name: string;
  avatarInitials: string;
  unreadNotifications: number;
}

// ── Dữ liệu dashboard cho từng con ──────────────────────────

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

// ── Loại cảnh báo ────────────────────────────────────────────

export type AlertType = "success" | "warning";

// ── Cảnh báo thông minh ──────────────────────────────────────

export interface SmartAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  actionLabel?: string;
  actionLink?: string;
}
