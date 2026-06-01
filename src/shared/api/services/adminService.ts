import { apiGet, apiPut } from "../client";
import type { ChildProfile } from "./childrenService";
import type { UserInfo } from "./authService";

/** Phụ huynh kèm danh sách con */
export interface ParentWithChildren extends UserInfo {
  children: ChildProfile[];
}

/** Thống kê tổng quan cho admin */
export interface AdminStats {
  totalParents: number;
  totalStudents: number;
  totalActive: number;
  totalSuspended: number;
  totalRevenue: number;
}

/**
 * Lấy danh sách tất cả phụ huynh (kèm con)
 */
export async function getParents(): Promise<ParentWithChildren[]> {
  return apiGet<ParentWithChildren[]>("/admin/parents");
}

/**
 * Lấy thống kê tổng quan
 */
export async function getStats(): Promise<AdminStats> {
  return apiGet<AdminStats>("/admin/stats");
}

/**
 * Cập nhật trạng thái tài khoản phụ huynh
 */
export async function updateParentStatus(
  parentId: string,
  status: "active" | "inactive" | "suspended"
): Promise<UserInfo> {
  return apiPut<UserInfo>(`/admin/parents/${parentId}/status`, { status });
}

/**
 * Cập nhật trạng thái tài khoản học sinh
 */
export async function updateStudentStatus(
  studentId: string,
  status: "active" | "inactive" | "suspended"
): Promise<ChildProfile> {
  return apiPut<ChildProfile>(`/admin/students/${studentId}/status`, { status });
}

/** Thống kê tài chính thực tế */
export interface FinanceStats {
  totalRevenue: number;
  totalTransactions: number;
  successTransactions: number;
  failedTransactions: number;
  mrr: number;
  activeSubscriptions: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  planBreakdown: Array<{
    plan: string;
    revenue: number;
    count: number;
  }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    status: string;
  }>;
  paymentOrdersStats: Array<{
    status: string;
    count: number;
    total: number;
  }>;
}

/**
 * Lấy thống kê tài chính thực tế
 */
export async function getFinanceStats(): Promise<FinanceStats> {
  return apiGet<FinanceStats>("/admin/finance-stats");
}

