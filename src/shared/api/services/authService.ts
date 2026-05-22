import { apiPost } from "../client";

/** Thông tin user trả về từ API (không chứa passwordHash) */
export interface UserInfo {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  avatarInitials: string | null;
  avatarId: string | null;
  role: "parent" | "admin";
  status: "active" | "inactive" | "suspended";
  unreadNotifications: number | null;
  createdAt: string;
}

/**
 * Đăng nhập bằng SĐT + mật khẩu
 */
export async function login(phone: string, password: string): Promise<UserInfo> {
  return apiPost<UserInfo>("/auth/login", { phone, password });
}

/**
 * Đăng ký tài khoản phụ huynh mới
 */
export async function register(data: {
  phone: string;
  password: string;
  name: string;
}): Promise<UserInfo> {
  return apiPost<UserInfo>("/auth/register", data);
}
