/**
 * ============================================================
 *  Types – Admin Dashboard
 *  Các kiểu dữ liệu quản trị: phụ huynh, học sinh, tài khoản admin.
 * ============================================================
 */

// ── Trạng thái tài khoản ─────────────────────────────────────

export type AccountStatus = "active" | "inactive" | "suspended";

// ── Học sinh (Admin view) ────────────────────────────────────

export interface AdminStudent {
  id: string;
  name: string;
  gender: "boy" | "girl";
  grade: string;
  avatarEmoji: string;
  plan: "FREE" | "PRO" | "VIP";
  totalLessons: number;
  avgScore: number;
  lastActive: string;
  status: AccountStatus;
  createdAt: string;
}

// ── Phụ huynh (Admin view) ───────────────────────────────────

export interface AdminParent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  status: AccountStatus;
  createdAt: string;
  children: AdminStudent[];
}

// ── Tài khoản admin ──────────────────────────────────────────

export interface AdminAccount {
  username: string;
  password: string;
  displayName: string;
  role: "admin";
}

// ── Thống kê tổng quan (Admin) ───────────────────────────────

export interface AdminStats {
  totalParents: number;
  totalStudents: number;
  activeToday: number;
  premiumUsers: number;
  newThisWeek: number;
  revenue: number;
}
